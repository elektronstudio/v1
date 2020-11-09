import { ref, watch, onMounted, computed } from "../deps/vue.js";

import {
  safeJsonParse,
  randomId,
  useSetInterval,
  any,
  adjectives,
  animals,
  socket,
  createMessage,
  fit,
  useLocalstorage,
} from "../lib/index.js";

import {
  chatUrl,
  imageScale,
  imageQuality,
  imageUpdateFrequency,
} from "../config/index.js";

import VideoGrid from "../components/VideoGrid.js";
import AspectRatio from "./AspectRatio.js";
import VideoConfirmation from "./VideoConfirmation.js";

const imageWidth = 150;
const imageHeight = 120;

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
        // const isPortrait = srcElement.videoHeight > srcElement.videoWidth;
        // canvasEl.value.width = srcElement.videoWidth * imageScale;
        // canvasEl.value.height =
        //   (srcElement.videoHeight * imageScale) / (isPortrait ? 2 : 1);
        canvasEl.value.width = imageWidth;
        canvasEl.value.height = imageHeight;
      });
    });

    const startVideo = () => {
      if (navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({ video: { frameRate: 10 } })
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
        incomingMessage.type === "IMAGE"
      ) {
        images.value[incomingMessage.userId] = incomingMessage;
      }
      if (
        incomingMessage &&
        incomingMessage.channel === props.channel &&
        incomingMessage.type === "IMAGE_LEAVE"
      ) {
        delete images.value[incomingMessage.userId];
      }
      if (incomingMessage && incomingMessage.type === "USERNAME_UPDATE") {
        // TODO: Rework this
        if (userId.value === incomingMessage.userId) {
          userName.value = incomingMessage.userName;
        }
        images.value = Object.fromEntries(
          Object.entries(images.value).map(([key, value]) => {
            if (value.userId === incomingMessage.userId) {
              value.userName = incomingMessage.userName;
            }
            return [key, value];
          })
        );
      }
    });

    const sendImageMessage = () => {
      //const isPortrait = videoEl.value.videoHeight > videoEl.value.videoWidth;
      const { x, y, width, height } = fit(
        imageWidth,
        imageHeight,
        videoEl.value.videoWidth,
        videoEl.value.videoHeight
      );
      context.value.drawImage(videoEl.value, x, y, width, height);

      const buffer = new Uint32Array(
        context.value.getImageData(
          0,
          0,
          canvasEl.value.width,
          canvasEl.value.width
        ).data.buffer
      );

      const outgoingMessage = createMessage({
        id: randomId(),
        channel: props.channel,
        type: "IMAGE",
        userId: userId.value,
        userName: userName.value,
        value: canvasEl.value.toDataURL("image/jpeg", imageQuality),
      });
      if (buffer.some((color) => color !== 0)) {
        socket.send(JSON.stringify(outgoingMessage));
      }
    };

    const sendStartMessage = () => {
      const outgoingMessage = createMessage({
        channel: props.channel,
        type: "IMAGE_JOIN",
        userId: userId.value,
        userName: userName.value,
      });
      socket.send(JSON.stringify(outgoingMessage));
    };

    const sendStopMessage = () => {
      const outgoingMessage = createMessage({
        channel: props.channel,
        type: "IMAGE_LEAVE",
        userId: userId.value,
        userName: userName.value,
      });
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
      sendStartMessage();
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
      Object.values(images.value).sort((a, b) => a.userId > b.userId)
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
  <video ref="videoEl" autoplay playsinline style="position: fixed; top: 0; left: 0; opacity: 0;" />
  <canvas ref="canvasEl" style="display: none;" />
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
            style="display: block; width: 100%;"
          />
          <div class="user-image-name" style="
            font-size: 0.8em;
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            padding: 8px;
            display: flex;
            align-items: flex-end;
            cursor: default;
          ">
            {{ image.userName }}
          </div>
        </div>
      </video-grid2>
    </video-confirmation>
  </aspect-ratio>
  `,
};
