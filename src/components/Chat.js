import { ref, onMounted, computed } from "../deps/vue.js";

import { useUser, useChat } from "../lib/index.js";

export default {
  props: {
    channel: {
      default: "test",
    },
    event: {
      default: null,
    },
  },
  setup(props) {
    const { userId, userName, onUserNameChange } = useUser();

    const {
      messages,
      newMessage,
      onNewMessage,
      likes,
      onLike,
      scrollEl,
      textareaEl,
    } = useChat(props.channel, {
      chattype:
        props.event && props.event.chattype ? props.event.chattype : "CHAT",
    });

    console.log(props.event);
    const messagesWithLikes = computed(() =>
      messages.value.map((m) => {
        const l = likes.value
          .map(({ value }) => value)
          .filter((value) => value === m.id);
        if (l.length) {
          m.likes = l.length;
        }
        return m;
      })
    );
    return {
      userId,
      userName,
      onUserNameChange,
      messagesWithLikes,
      likes,
      newMessage,
      onNewMessage,
      onLike,
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
      <div v-for="message in messagesWithLikes" style="margin-bottom: 24px" >
        <chat-message :message="message" :userId="userId" @onLike="onLike(message.id, userId)">
      </div>
    </div>
    <div style="margin-top: 8px; transform: translateY(-10px);">
      <textarea style="width: 100%" ref="textareaEl" v-model="newMessage" ></textarea>
    </div>
    <div style="display: flex; align-tems: top: justify-content: space-between; margin-top: 24px; transform: translateY(-24px);">
      <div style="font-size: 13px; opacity: 0.7">My userId: {{ userId }}<br />My userName: {{ userName }}<br /><a href="" @click.prevent="onUserNameChange">Change username</a></div>
      &nbsp;
      <button @click="onNewMessage">Send</button>
    </div>
  </div>  
  `,
};
