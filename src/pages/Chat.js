import { ref, onMounted } from "../deps/vue.js";
import { safeJsonParse } from "../utils/index.js";

export default {
  setup() {
    const messagesEl = ref(null);
    const chatUrl = "wss://ws-fggq5.ondigitalocean.app";

    const messages = ref([]);
    const newMessage = ref("");

    const socket = new WebSocket(chatUrl);

    socket.onmessage = ({ data }) => {
      const incomingMessage = safeJsonParse(data);
      if (incomingMessage && incomingMessage.type === "message") {
        messages.value.push(incomingMessage);
      }
    };

    const onNewMessage = (value) => {
      const outgoingMessage = {
        type: "message",
        value: newMessage.value,
      };
      socket.send(JSON.stringify(outgoingMessage));
      newMessage.value = "";
    };

    onMounted(() => {
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
