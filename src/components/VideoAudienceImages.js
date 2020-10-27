import { ref, watch, onMounted, computed } from "../deps/vue.js";
import { useLocalstorage } from "../hooks/index.js";
import {
  safeJsonParse,
  randomId,
  useSetInterval,
  any,
  adjectives,
  animals,
  socket,
} from "../utils/index.js";
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
  props: {
    channel: {
      default: "test",
    },
    ratio: {
      default: 1,
    },
  },
  setup(props) {
    const videoEl = ref(null);
    const canvasEl = ref(null);
    const context = ref(null);
    const image = ref(null);
    const images = ref({});
    const imagesLength = computed(() => Object.entries(images.value).length);
    const videoStarted = ref(false);
    const userId = useLocalstorage("elektron_user_id", randomId());
    const userName = useLocalstorage(
      "elektron_user_name",
      `${any(adjectives)} ${any(animals)}`
    );

    onMounted(() => {
      context.value = canvasEl.value.getContext("2d");
      videoEl.value.addEventListener("loadedmetadata", ({ srcElement }) => {
        const isPortrait = srcElement.videoHeight > srcElement.videoWidth;
        canvasEl.value.width = srcElement.videoWidth * imageScale;
        canvasEl.value.height =
          (srcElement.videoHeight * imageScale) / (isPortrait ? 2 : 1);
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

    socket.addEventListener("message", ({ data }) => {
      const incomingMessage = safeJsonParse(data);
      if (
        incomingMessage &&
        incomingMessage.channel === props.channel &&
        incomingMessage.type === "userImage"
      ) {
        images.value[incomingMessage.from.id] = incomingMessage;
      }
      if (
        incomingMessage &&
        incomingMessage.channel === props.channel &&
        incomingMessage.type === "userStop"
      ) {
        delete images.value[incomingMessage.from.id];
      }
    });

    const sendImageMessage = () => {
      const isPortrait = videoEl.value.videoHeight > videoEl.value.videoWidth;
      context.value.drawImage(
        videoEl.value,
        0,
        videoEl.value.videoHeight * imageScale * (isPortrait ? -0.5 : 0),
        videoEl.value.videoWidth * imageScale,
        videoEl.value.videoHeight * imageScale
      );

      const buffer = new Uint32Array(
        context.value.getImageData(
          0,
          0,
          canvasEl.value.width,
          canvasEl.value.width
        ).data.buffer
      );

      const outgoingMessage = {
        id: randomId(),
        channel: props.channel,
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
      if (buffer.some((color) => color !== 0)) {
        socket.send(JSON.stringify(outgoingMessage));
      }
    };

    const sendStopMessage = () => {
      const outgoingMessage = {
        id: randomId(),
        channel: props.channel,
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
      window.removeEventListener("beforeunload", onStop);
    };

    window.addEventListener("beforeunload", onStop);

    const images2 = computed(() =>
      Object.values(images.value).sort((a, b) => a.from.id > b.from.id)
    );
    return {
      videoEl,
      canvasEl,
      sendImageMessage,
      image,
      images,
      imagesLength,
      videoStarted,
      onStart,
      onStop,
      images2,
    };
  },
  template: `
  <aspect-ratio :ratio="ratio">
    <video-confirmation
      :started="videoStarted"
      @start="onStart"
      @stop="onStop"
    >
      <video-grid v-if="videoStarted" :ratio="ratio">
        <div
          v-for="image in images2"
          :key="image.id"
          style="position: relative"
        >
          <img
            :src="image.value" 
            style="width: 100%"
          />
          <div class="user-image-name" style="
            font-size: 0.8em;
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            padding: 16px;
            display: flex;
            align-items: flex-end;
            cursor: default;
          ">
            {{ image.from.name  }}
          </div>
        </div>
      </video-grid2>
    </video-confirmation>
  </aspect-ratio>
  <video ref="videoEl" autoplay style="display: none;" />
  <canvas ref="canvasEl" style="display: none;" />
  `,
};
