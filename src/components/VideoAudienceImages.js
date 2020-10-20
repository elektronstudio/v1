import { ref, onMounted, computed } from "../deps/vue.js";
import { useLocalstorage } from "../hooks/index.js";
import { safeJsonParse, randomId, useSetInterval } from "../utils/index.js";
import { chatUrl, useConfig } from "../config/index.js";

import VideoGrid from "../components/VideoGrid.js";
import AspectRatio from "./AspectRatio.js";
import VideoConfirmation from "./VideoConfirmation.js";

const scale = 1 / 8;
const quality = 0.8;

export default {
  components: {
    AspectRatio,
    VideoConfirmation,
    VideoGrid,
  },
  setup() {
    const videoEl = ref(null);
    const canvasEl = ref(null);
    const context = ref(null);
    const image = ref(null);
    const images = ref({});
    const imagesLength = computed(() => Object.entries(images.value).length);
    const videoStarted = ref(false);
    const id = "test";
    const { userId, userName } = useConfig();

    onMounted(() => {
      context.value = canvasEl.value.getContext("2d");
      videoEl.value.addEventListener("loadedmetadata", ({ srcElement }) => {
        canvasEl.value.width = srcElement.videoWidth * scale;
        canvasEl.value.height = srcElement.videoHeight * scale;
      });
    });

    const startVideo = () => {
      if (navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({ video: true })
          .then((stream) => (videoEl.value.srcObject = stream))
          .catch((e) => console.log(e));
      }
    };

    const stopVideo = () => {
      videoEl.value.srcObject.getTracks().forEach((track) => track.stop());
      delete images.value[userId.value];
    };

    const socket = new WebSocket(chatUrl);

    socket.onmessage = ({ data }) => {
      const incomingMessage = safeJsonParse(data);
      if (
        incomingMessage &&
        incomingMessage.channel === id &&
        incomingMessage.type === "userImage"
      ) {
        images.value[incomingMessage.from.id] = incomingMessage;
      }
      if (
        incomingMessage &&
        incomingMessage.channel === id &&
        incomingMessage.type === "userStop"
      ) {
        delete images.value[incomingMessage.from.id];
      }
    };

    const sendImageMessage = () => {
      context.value.drawImage(
        videoEl.value,
        0,
        0,
        videoEl.value.videoWidth * scale,
        videoEl.value.videoHeight * scale
      );
      const outgoingMessage = {
        id: randomId(),
        channel: id,
        type: "userImage",
        value: canvasEl.value.toDataURL("image/jpeg", quality),
        from: {
          type: "user",
          id: userId.value,
          name: userName.value,
        },
        to: {
          type: "all",
        },
        datetime: new Date().toISOString(),
      };
      socket.send(JSON.stringify(outgoingMessage));
    };

    const sendStopMessage = () => {
      const outgoingMessage = {
        id: randomId(),
        channel: id,
        type: "userStop",
        value: null,
        from: {
          type: "user",
          id: userId.value,
          name: userName.value,
        },
        to: {
          type: "all",
        },
        datetime: new Date().toISOString(),
      };
      socket.send(JSON.stringify(outgoingMessage));
    };

    useSetInterval(sendImageMessage, imagesLength, videoStarted, 1000);

    const onStart = () => {
      startVideo();
      videoStarted.value = true;
    };
    const onStop = () => {
      stopVideo();
      sendStopMessage();
      videoStarted.value = false;
    };

    return {
      videoEl,
      canvasEl,
      sendImageMessage,
      image,
      images,
      videoStarted,
      onStart,
      onStop,
    };
  },
  template: `
  <aspect-ratio :ratio="1">
    <video-confirmation
      :started="videoStarted"
      @start="onStart"
      @stop="onStop"
    >
      <video-grid>
        <img
          v-for="image in images"
          :key="image.value.split(',')[1].slice(0,10)" 
          :src="image.value" 
          style="width: 100%"
        />
      </video-grid>
    </video-confirmation>
  </aspect-ratio>
  <video ref="videoEl" autoplay style="display: none;" />
  <canvas ref="canvasEl" style="display: none;" />
  `,
};
