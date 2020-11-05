import { ref, watch, onMounted, computed } from "../deps/vue.js";
import { useSetInterval, socket, uuidv4 } from "../utils/index.js";
import {
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
    // Set up reactive variables

    const videoEl = ref(null);
    const canvasEl = ref(null);
    const context = ref(null);
    const image = ref(null);
    const images = ref([]);
    const imagesLength = computed(() => Object.entries(images.value).length);
    const videoStarted = ref(false);

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
    };

    const uuid = uuidv4();

    const sendImage = () => {
      const isPortrait = videoEl.value.videoHeight > videoEl.value.videoWidth;
      context.value.drawImage(
        videoEl.value,
        0,
        videoEl.value.videoHeight * imageScale * (isPortrait ? -0.5 : 0),
        videoEl.value.videoWidth * imageScale,
        videoEl.value.videoHeight * imageScale
      );

      const imageData = canvasEl.value.toDataURL("image/jpeg", imageQuality);

      const payload = {
        uuid,
        feed: props.channel,
        imgFull: imageData, // TODO: remove scaling
        imgScaled: imageData,
      };

      fetch("https://elektron.live/area51/upload.php", {
        method: "POST",
        body: JSON.stringify(payload),
      })
        .then((res) => res.json())
        .then((res) => {
          images.value = res.images ? res.images : [];
        });
    };

    useSetInterval(
      sendImage,
      ref(1), // TODO: Clean this up
      videoStarted,
      imageUpdateFrequency
    );

    const onStart = () => {
      startVideo();
      videoStarted.value = true;
    };

    const onStop = () => {
      stopVideo();
      videoStarted.value = false;
      window.removeEventListener("beforeunload", onStop);
    };

    window.addEventListener("beforeunload", onStop);

    return {
      videoEl,
      canvasEl,
      sendImage,
      image,
      images,
      imagesLength,
      videoStarted,
      onStart,
      onStop,
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
        <div v-for="image in images">
          <img
            :src="image.imgData" 
            style="display: block; width: 100%;"
          />
        </div>
      </video-grid>
    </video-confirmation>
  </aspect-ratio>
  <video ref="videoEl" autoplay style="display: none;" />
  <canvas ref="canvasEl" style="display: none;" />
  `,
};
