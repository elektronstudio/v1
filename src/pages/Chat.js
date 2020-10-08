import { ref, onMounted } from "../deps/vue.js";
import { useLocalstorage, useKey } from "../hooks/index.js";
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

    const onNewMessage = () => {
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

    const keyEl = useKey("Enter", onNewMessage);

    onMounted(() => {
      messagesEl.value.scrollTop = messagesEl.value.scrollHeight;
      const observer = new MutationObserver(
        () => (messagesEl.value.scrollTop = messagesEl.value.scrollHeight)
      );
      observer.observe(messagesEl.value, { childList: true });
    });

    return { messages, messagesEl, newMessage, onNewMessage, userId, keyEl };
  },
  template: `
  <div class="layout-live">
    <div style="grid-area: main">
      <h1>Chat demo</h1>
    </div>
    <div style="
      grid-area: chat;
      display: grid;
      grid-template-rows: 1fr auto;
      height: 100%;
      border: 1px solid blue;
      gap: 8px;
    ">
      <div
        ref="messagesEl"
        style="
          border: 1px solid red;
          height: 100%;
          overflow: scroll;
        ">
        <div v-for="message in messages" style="margin-bottom: 12px" >
          <chat-message :message="message" :userId="userId">
        </div>
      </div>
      <div style="
        display: grid;
        grid-template-columns: 1fr auto;
        align-items: flex-start;
        gap: 8px;
      ">
        <textarea ref="keyEl" v-model="newMessage"></textarea>
        <button @click="onNewMessage">Send</button>
      </div>
    </div>
  </div>
  `,
};
