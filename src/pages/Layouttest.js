import { ref, computed } from "../deps/vue.js";

import AspectRatio from "../components/AspectRatio.js";
import VideoPerformer from "../components/VideoPerformer.js";
import ChatAudienceMessages from "../components/ChatAudienceMessages.js";
import VideoAudienceImages from "../components/VideoAudienceImages.js";
import IconToLeft from "../components/IconToLeft.js";
import IconToRight from "../components/IconToRight.js";

export default {
  components: {
    VideoPerformer,
    IconToLeft,
    IconToRight,
    ChatAudienceMessages,
    VideoAudienceImages,
  },
  setup() {
    const chatOpen = ref(true);
    const style = computed(() => {
      return {
        gridTemplateColumns: chatOpen.value
          ? "3fr minmax(300px, auto) 300px"
          : "3fr minmax(300px, auto) 20px",
      };
    });
    const onClick = () => (chatOpen.value = !chatOpen.value);
    return { onClick, style, chatOpen };
  },
  template: `
  <div class="layout-test" :style="style">
    <div style="border: 2px solid red; grid-area: performer">
      <video-performer></video-performer>
    </div>
    <div
      style="
        grid-area: audience;
        position: sticky;
        top: 32px;
        display: grid;
        grid-template-rows: auto 1fr;
        border: 2px solid yellow;
        height: calc(100vh - 32px - 32px);
      "
    >
      <div style="margin-bottom: 16px"><h4>Live audience</h4></div>
      <video-audience-images style="border: 2px solid blue" :ratio="1 / 2" />
    </div>
    <div
      style="
        grid-area: chat;
        position: sticky;
        top: 32px;
        display: grid;
        grid-template-rows: auto 1fr;
        border: 2px solid yellow;
        height: calc(100vh - 32px - 32px);
      "
    >
      <div @click="onClick"
        style="
          margin-bottom: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
        ">
        <h4 v-if="chatOpen">Chat</h4>
        <icon-to-left v-if="!chatOpen" />
        <icon-to-right v-if="chatOpen" />
      </div>
      <chat-audience-messages v-if="chatOpen" style="border: 2px solid red" />
    </div>
    <div style="border: 2px solid red; padding: 15px; grid-area: about">
      {{ Array.from({ length: 300}).map(_ => 'absaa').join(' ') }}
    </div>

  </div>
  `,
};
