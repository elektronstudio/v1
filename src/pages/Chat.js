import { ref, onMounted } from "../deps/vue.js";
import { utcToZonedTime, zonedTimeToUtc, format } from "../deps/date-fns-tz.js";
import { useLocalstorage } from "../hooks/index.js";
import {
  safeJsonParse,
  createNow,
  randomId,
  any,
  adjectives,
  animals,
} from "../utils/index.js";

import ChatMessage from "../components/ChatMessage.js";

export default {
  components: { ChatMessage },
  setup() {
    const chatUrl = "wss://ws-fggq5.ondigitalocean.app";

    const messagesEl = ref(null);
    const userId = useLocalstorage("elektron_user_id", randomId());
    const userName = useLocalstorage(
      "elektron_use_name",
      `${any(adjectives)} ${any(animals)}`
    );
    const messages = useLocalstorage("elektron_chat", []);
    const newMessage = ref("");

    const socket = new WebSocket(chatUrl);

    socket.onmessage = ({ data }) => {
      const incomingMessage = safeJsonParse(data);
      if (incomingMessage && incomingMessage.type === "message") {
        messages.value = [...messages.value, incomingMessage];
      }
    };

    const onNewMessage = (value) => {
      const outgoingMessage = {
        type: "message",
        value: newMessage.value,
        userId: userId.value,
        userName: userName.value,
        datetime: createNow(),
      };
      socket.send(JSON.stringify(outgoingMessage));
      newMessage.value = "";
    };

    onMounted(() => {
      messagesEl.value.scrollTop = messagesEl.value.scrollHeight;
      const observer = new MutationObserver(
        () => (messagesEl.value.scrollTop = messagesEl.value.scrollHeight)
      );
      observer.observe(messagesEl.value, { childList: true });
    });

    return { messages, messagesEl, newMessage, onNewMessage };
  },
  template: `
  <div class="layout-index">
    <div style="grid-area: events">
      <h1>Chat</h1>
      <div ref="messagesEl" style="border: 1px solid red; height: 50vh; overflow: scroll">
        <pre v-for="message in messages">{{ message }}</pre>
      </div>
      <div>
        <textarea v-model="newMessage"></textarea>
        <button @click="onNewMessage">Send</button>
      </div>
    </div>
  </div>
  `,
};
