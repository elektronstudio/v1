import { ref, onMounted } from "../deps/vue.js";
import { useLocalstorage } from "../hooks/index.js";
import {
  safeJsonParse,
  randomId,
  any,
  adjectives,
  animals,
} from "../utils/index.js";

import VideoGrid from "../components/VideoGrid.js";
import { chatUrl } from "../config/index.js";

const scale = 0.25;

export default {
  components: { VideoGrid },
  setup() {
    const videoEl = ref(null);
    const canvasEl = ref(null);
    const context = ref(null);
    const image = ref(null);
    const images = ref([]);

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
        images.value.push(incomingMessage);
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

    //setInterval(sendMessage, 1000);

    return { videoEl, canvasEl, sendMessage, image, images };
  },
  template: `
  <div>
    <video ref="videoEl" autoplay style="display: none;" />
    <canvas ref="canvasEl" style="display: none;" />
    <button @click="sendMessage">Send</button>
    <video-grid :length="images.length">
      <img
        v-for="image in images"
        :key="image.value.split(',')[1].slice(0,10)" 
        :src="image.value" 
        style="width: 100%"
      />
    </div>
  </div>
  `,
};
