import { ref, onMounted } from "../deps/vue.js";
import { useLocalstorage } from "../hooks/index.js";
import {
  safeJsonParse,
  randomId,
  any,
  adjectives,
  animals,
} from "../utils/index.js";

import { chatUrl } from "../config/index.js";

const scale = 0.25;

export default {
  setup() {
    const videoEl = ref(null);
    const canvasEl = ref(null);
    const context = ref(null);
    const image = ref(null);

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

    const images = ref([]);

    const socket = new WebSocket(chatUrl);

    socket.onmessage = ({ data }) => {
      const incomingMessage = safeJsonParse(data);
      if (
        incomingMessage &&
        incomingMessage.type === "userImage" &&
        incomingMessage.channel == id
      ) {
        image.value = incomingMessage.value;
        console.log(incomingMessage.value);
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

    return { videoEl, canvasEl, sendMessage, image };
  },
  template: `
  <div>
    <video ref="videoEl" autoplay style="border: 1px solid red" />
    <canvas ref="canvasEl" style="border: 1px solid red; width: 100%" />
    <button @click="sendMessage">Send</button>
    <img :src="image" style="border: 1px solid red; width: 100%" />
  </div>
  `,
};
