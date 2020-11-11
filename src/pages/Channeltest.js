// import { ref, onMounted } from "../deps/vue.js";

import { useChannel, useUser, useSettings, useChat } from "../lib/index.js";

export default {
  setup() {
    const { userName, onUserNameChange } = useUser();
    const {
      messages,
      newMessage,
      onNewMessage,
      scrollEl,
      textareaEl,
    } = useChat("foyer2");
    const settings = useSettings();
    const { channels, count } = useChannel("foyer2");
    const { channels3 } = useChannel("foyer3");

    return {
      userName,
      channels,
      channels3,
      count,
      settings,
      onUserNameChange,
      messages,
      newMessage,
      onNewMessage,
      scrollEl,
      textareaEl,
    };
  },
  template: `
  <div class="layout-videotest">
    <div>
      {{ userName }}
      <button @click="onUserNameChange">Change name</button>
      <div><input v-model="userName" /></div>
      <div>{{ settings.positionX }} <p /><input v-model="settings.positionX" type="range" /></div>
      <pre>{{ channels }}</pre>
      <pre>{{ channels3 }}</pre>
    </div>
    <div>
      <textarea ref="textareaEl" v-model="newMessage" />
      <div><button @click="onNewMessage">Send</button></div>
      <div><button @click="onUserNameChange">Change username</button></div>
      <pre ref="scrollEl">{{ messages }}</pre>
    </div>
    <pre>{{ count }}</pre>
  </div>
  `,
};
