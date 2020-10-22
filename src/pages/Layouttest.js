import { ref, computed, watch } from "../deps/vue.js";
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

    // const style = computed(() => {
    //   return {
    //     gridTemplateColumns: chatVisible.value
    //       ? "1fr 350px 300px"
    //       : "1fr 350px 40px",
    //   };
    // });

    watch(
      chatVisible,
      (visible) => {
        document.body.style.setProperty(
          "--cols",
          visible ? "1fr 350px 300px" : "1fr 350px 40px"
        );
      },
      { immediate: true }
    );

    const onToggleChat = () => {
      chatVisible.value = !chatVisible.value;
    };

    return { channel, event, clientsCount, onToggleChat, chatVisible };
  },
  template: `
  <div class="layout-test">
    <div style="grid-area: performer">
      <video-performer :channel="channel" />
    </div>
    <div
      class="panel-audience"
      style="
        grid-area: audience;
        background: rgba(255,255,255,0.075);
      "
    >
      <div class="flex-justified" style="margin-bottom: 16px; min-height: 32px;">
        <h4>Live audience</h4>
        <div style="opacity: 0.5">{{ clientsCount }} online</div>
      </div>
      <video-audience-images :channel="channel" style="border: 2px solid blue" :ratio="1 / 2" />
    </div>
    <div
      class="panel-chat"
      style="
        grid-area: chat;
        background: rgba(255,255,255,0.15);
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
          min-height: 32px;
        ">
        <h4 v-if="chatVisible">Chat</h4>
        <icon-to-left v-if="!chatVisible" />
        <icon-to-right v-if="chatVisible" />
      </div>
      <chat-audience-messages :channel="channel" v-if="chatVisible" />
    </div>
    <div style="padding: 32px; grid-area: about">
      <event-details :event="event" />
    </div>
  </div>
  `,
};
