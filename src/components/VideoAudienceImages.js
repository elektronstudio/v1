import { ref, onMounted, computed } from "../deps/vue.js";
import { useLocalstorage } from "../hooks/index.js";
import {
  safeJsonParse,
  randomId,
  any,
  adjectives,
  animals,
  useSetInterval,
} from "../utils/index.js";

import VideoGrid from "../components/VideoGrid.js";
import { chatUrl } from "../config/index.js";

const scale = 4;

export default {
  components: { VideoGrid },
  setup() {
    const videoEl = ref(null);
    const canvasEl = ref(null);
    const context = ref(null);
    const image = ref(null);
    const images = ref({});
    const imagesLength = computed(() => Object.entries(images.value).length);

    onMounted(() => {
      context.value = canvasEl.value.getContext("2d");
      videoEl.value.addEventListener("loadedmetadata", ({ srcElement }) => {
        canvasEl.value.width = srcElement.videoWidth * scale;
        canvasEl.value.height = srcElement.videoHeight * scale;
      });
      if (navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({ video: true })
          .then((stream) => (videoEl.value.srcObject = stream))
          .catch((e) => console.log(e));
      }
    });

    const id = "test";

    const userId = useLocalstorage("elektron_user_id", randomId());
    const userName = useLocalstorage(
      "elektron_user_name",
      `${any(adjectives)} ${any(animals)}`
    );

    const socket = new WebSocket(chatUrl);

    socket.onmessage = ({ data }) => {
      const incomingMessage = safeJsonParse(data);
      if (
        incomingMessage &&
        incomingMessage.type === "userImage" &&
        incomingMessage.channel == id
      ) {
        images.value[incomingMessage.from.id] = incomingMessage;
      }
    };

    const sendMessage = () => {
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
        value: canvasEl.value.toDataURL("image/jpeg", 0.5),
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

    socket.onopen = () => sendMessage();

    useSetInterval(sendMessage, 1000, imagesLength);

    return { videoEl, canvasEl, sendMessage, image, images };
  },
  template: `
  <div>
    <video-grid>
      <img
        v-for="image in images"
        :key="image.value.split(',')[1].slice(0,10)" 
        :src="image.value" 
        style="width: 100%"
      />
    </video-grid>
    <video ref="videoEl" autoplay style="display: none;" />
    <canvas ref="canvasEl" style="display: none;" />
  </div>
  `,
};
