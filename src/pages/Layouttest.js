import { ref, computed } from "../deps/vue.js";
import { useRoute } from "../deps/router.js";

import { useState, useClientsCount } from "../hooks/index.js";
import { fetchEvents } from "../utils/index.js";
import { mainInputUrl, eventsUrl } from "../config/index.js";

import EventDetails from "../components/EventDetails.js";
import AspectRatio from "../components/AspectRatio.js";
import VideoPerformer from "../components/VideoPerformer.js";
import ChatAudienceMessages from "../components/ChatAudienceMessages.js";
import VideoAudienceImages from "../components/VideoAudienceImages.js";
import IconToLeft from "../components/IconToLeft.js";
import IconToRight from "../components/IconToRight.js";

export default {
  components: {
    EventDetails,
    VideoPerformer,
    IconToLeft,
    IconToRight,
    ChatAudienceMessages,
    VideoAudienceImages,
  },
  setup() {
    const clientsCount = useClientsCount();

    const { params } = useRoute();
    const channel = params.channel;

    // Fetch and parse event

    const event = ref(null);

    fetchEvents(eventsUrl).then((events) => {
      const e = events.filter(({ id }) => {
        return id === channel;
      });
      event.value = e[0];
      if (event.value && event.value.color) {
        document.body.style.setProperty("background", event.value.color);
      }
    });

    // Chat

    const { chatVisible } = useState();

    const style = computed(() => {
      return {
        gridTemplateColumns: chatVisible.value
          ? "1fr 350px 300px"
          : "1fr 350px 40px",
      };
    });
    const onToggleChat = () => {
      chatVisible.value = !chatVisible.value;
    };

    return { event, clientsCount, onToggleChat, style, chatVisible };
  },
  template: `
  <div class="layout-test" :style="style">
    <div style="grid-area: performer">
      <video-performer></video-performer>
    </div>
    <div
      style="
        grid-area: audience;
        position: sticky;
        top: 0;
        display: grid;
        grid-template-rows: auto 1fr;
        height: 100vh;
        background: rgba(30,30,30,0.5);
        padding: 24px;
      "
    >
      <div class="flex-justified" style="margin-bottom: 16px; height: 32px;">
        <h4>Live audience</h4>
        <div style="opacity: 0.5">{{ clientsCount }} online</div>
      </div>
      <video-audience-images style="border: 2px solid blue" :ratio="1 / 2" />
    </div>
    <div
      style="
        grid-area: chat;
        position: sticky;
        top: 0;
        display: grid;
        grid-template-rows: auto 1fr;
        height: 100vh;
        background: rgba(30,30,30,0.75);
        padding: 24px;
      "
      :style="{padding: chatVisible ? '24px' : '24px 10px'}"
    >
      <div @click="onToggleChat"
        style="
          margin-bottom: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          height: 32px;
        ">
        <h4 v-if="chatVisible">Chat</h4>
        <icon-to-left v-if="!chatVisible" />
        <icon-to-right v-if="chatVisible" />
      </div>
      <chat-audience-messages v-if="chatVisible" />
    </div>
    <div style="padding: 32px; grid-area: about">
      <event-details :event="event" />
    </div>
  </div>
  `,
};
