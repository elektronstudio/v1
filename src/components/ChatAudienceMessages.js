import { ref, onMounted } from "../deps/vue.js";

import {
  adjectives,
  animals,
  any,
  createMessage,
  events,
  randomId,
  safeJsonParse,
  socket,
  uniqueCollection,
  useLocalstorage,
  useScrollToBottom,
  useTextarea,
} from "../lib/index.js";

import ChatMessage from "./ChatMessage.js";

export default {
  components: { ChatMessage },
  props: {
    channel: {
      default: "test",
    },
  },
  setup(props) {
    const userId = useLocalstorage("elektron_user_id", randomId());
    const userName = useLocalstorage(
      "elektron_user_name",
      `${any(adjectives)} ${any(animals)}`
    );
    const messages = useLocalstorage("elektron_messages", []);
    const newMessage = ref("");

    socket.addEventListener("message", ({ data }) => {
      const incomingMessage = safeJsonParse(data);

      if (incomingMessage && incomingMessage.type === "USERNAME_UPDATE") {
        messages.value = messages.value.map((m) => {
          if (m.userId === incomingMessage.userId) {
            m.userName = incomingMessage.userName;
          }
          return m;
        });
      }

      if (incomingMessage && incomingMessage.channel === props.channel) {
        if (incomingMessage.type === "CHAT") {
          if (incomingMessage.value === "/reload") {
            window.location.reload();
          } else if (incomingMessage.value === "/clear") {
            messages.value = [];
          } else {
            messages.value = [...messages.value, incomingMessage];
          }
        }
        // TODO: Move heart handling to a separate component
        if (incomingMessage.type === "HEART") {
          messages.value = [
            ...messages.value,
            { ...incomingMessage, value: "❤️" },
          ];
        }
        // Sync the archive

        if (incomingMessage.type === "CHAT_SYNC") {
          const syncedMessages = uniqueCollection(
            [...messages.value, ...incomingMessage.value],
            "id"
          );
          messages.value = syncedMessages;
        }
      }
    });

    const onNewMessage = () => {
      const outgoingMessage = createMessage({
        type: "CHAT",
        channel: props.channel,
        userId: userId.value,
        userName: userName.value,
        value: newMessage.value,
      });
      socket.send(JSON.stringify(outgoingMessage));
      newMessage.value = "";
    };

    events.on("heart", () => {
      const outgoingMessage = {
        type: "HEART",
        channel: props.channel,
        userId: userId.value,
        userName: userName.value,
      };
      socket.send(JSON.stringify(outgoingMessage));
    });

    const onNameChange = () => {
      const newName = window.prompt("Enter your name", userName.value);
      if (newName) {
        userName.value = newName;
        const outgoingMessage = createMessage({
          type: "USERNAME_UPDATE",
          userId: userId.value,
          userName: userName.value,
        });
        socket.send(JSON.stringify(outgoingMessage));
      }
    };

    const textareaEl = useTextarea(onNewMessage);
    const scrollEl = useScrollToBottom();

    return {
      messages,
      newMessage,
      onNewMessage,
      userId,
      userName,
      onNameChange,
      scrollEl,
      textareaEl,
    };
  },
  template: `
  <div style="height: 100%">
    <div
      ref="scrollEl"
      style="
        height: 70vh;
        overflow: auto;
      ">
      <div v-for="message in messages" style="margin-bottom: 24px" >
        <chat-message :message="message" :userId="userId">
      </div>
    </div>
    <div style="margin-top: 8px; transform: translateY(-10px);">
      <textarea style="width: 100%" ref="textareaEl" v-model="newMessage" ></textarea>
    </div>
    <div style="display: flex; align-items: space-between; margin-top: 24px; transform: translateY(-24px);">
      <div style="font-size: 13px; opacity: 0.7">My userName is currently {{ userName }}. <a href="" @click.prevent="onNameChange">Change</a></div>
      &nbsp;
      <button @click="onNewMessage">Send</button>
    </div>
  </div>  
  `,
};
