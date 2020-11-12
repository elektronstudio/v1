import { ref, onMounted } from "../deps/vue.js";

import { useUser, useChat } from "../lib/index.js";

export default {
  props: {
    channel: {
      default: "test",
    },
  },
  setup(props) {
    const { userName, onUserNameChange } = useUser();

    const {
      messages,
      newMessage,
      onNewMessage,
      scrollEl,
      textareaEl,
    } = useChat(props.channel);

    return {
      userName,
      onUserNameChange,
      messages,
      newMessage,
      onNewMessage,
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
      <div style="font-size: 13px; opacity: 0.7">My userName is currently {{ userName }}. <a href="" @click.prevent="onUserNameChange">Change</a></div>
      &nbsp;
      <button @click="onNewMessage">Send</button>
    </div>
  </div>  
  `,
};
