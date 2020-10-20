import { ref, onMounted, computed, TransitionGroup } from "../deps/vue.js";
import { useState } from "../hooks/index.js";
import { safeJsonParse, randomId, useSetInterval } from "../utils/index.js";
import {
  chatUrl,
  imageScale,
  imageQuality,
  imageUpdateFrequency,
} from "../config/index.js";

import VideoGrid from "../components/VideoGrid.js";
import AspectRatio from "./AspectRatio.js";
import VideoConfirmation from "./VideoConfirmation.js";

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
    const { userId, userName } = useState();

    onMounted(() => {
      context.value = canvasEl.value.getContext("2d");
      videoEl.value.addEventListener("loadedmetadata", ({ srcElement }) => {
        canvasEl.value.width = srcElement.videoWidth * imageScale;
        canvasEl.value.height = srcElement.videoHeight * imageScale;
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
        videoEl.value.videoWidth * imageScale,
        videoEl.value.videoHeight * imageScale
      );
      const outgoingMessage = {
        id: randomId(),
        channel: id,
        type: "userImage",
        value: canvasEl.value.toDataURL("image/jpeg", imageQuality),
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

    useSetInterval(
      sendImageMessage,
      imagesLength,
      videoStarted,
      imageUpdateFrequency
    );

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
          :src="image.value" 
          :key="image.id"
          style="width: 100%"
        />
      </video-grid>
    </video-confirmation>
  </aspect-ratio>
  <video ref="videoEl" autoplay style="display: none;" />
  <canvas ref="canvasEl" style="display: none;" />
  `,
};
