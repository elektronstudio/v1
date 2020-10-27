import { ref, onMounted } from "../deps/vue.js";

import {
  useScrollToBottom,
  useTextarea,
  useLocalstorage,
} from "../hooks/index.js";

import {
  safeJsonParse,
  randomId,
  any,
  adjectives,
  animals,
  events,
} from "../utils/index.js";

import { socket } from "../utils/index.js";

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
      if (
        incomingMessage &&
        incomingMessage.type === "message" &&
        incomingMessage.channel === props.channel
      ) {
        if (incomingMessage.value === "/reload") {
          window.location.reload();
        } else if (incomingMessage.value === "/clear") {
          messages.value = [];
        } else {
          messages.value = [...messages.value, incomingMessage];
        }
      }
    });

    const onNewMessage = () => {
      const outgoingMessage = {
        id: randomId(),
        channel: props.channel,
        type: "message",
        value: newMessage.value,
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
      newMessage.value = "";
    };

    events.on("heart", () => {
      const outgoingMessage = {
        id: randomId(),
        channel: props.channel,
        type: "message",
        value: "❤️",
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
    });

    const onNameChange = () => {
      const newName = window.prompt("Enter your name", userName.value);
      if (newName) {
        userName.value = newName;
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
    <div style="margin-top: 8px;">
      <textarea style="width: 100%" ref="textareaEl" v-model="newMessage" ></textarea>
    </div>
    <div style="display: flex; align-items: space-between; margin-top: 4px;">
      <div style="font-size: 13px; opacity: 0.7">My username is currently {{ userName }}. <a href="" @click.prevent="onNameChange">Change</a></div>
      &nbsp;
      <button @click="onNewMessage">Send</button>
    </div>
  </div>  
  `,
};
