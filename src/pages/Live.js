import { ref, computed, watch } from "../deps/vue.js";
import { useRoute } from "../deps/router.js";

import { useChannel, fetchEvents } from "../lib/index.js";

import { eventsUrl } from "../../config.js";

export default {
  setup() {
    const { params } = useRoute();
    const channel = params.channel;

    const { count } = useChannel(channel);

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
      if (!event.value) {
        event.value = {
          experimental: true,
          id: channel,
          summary: channel,
        };
      }
    });

    // Chat

    const chatVisible = ref(true);

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

    return {
      channel,
      event,
      count,
      onToggleChat,
      chatVisible,
    };
  },
  template: `
  <div class="layout-live">
    <div style="grid-area: performer">
      <performer-video v-if="event" :channel="channel" :experimental="false" />
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
        <div style="opacity: 0.5">{{ count }} online</div>
      </div>
      <audience-websocket v-if="event" :channel="channel" :ratio="1 / 2" />
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
      <chat :channel="channel" v-if="chatVisible" />
    </div>
    <div style="padding: 32px; grid-area: about">
      <event-details :event="event" />
    </div>
  </div>
  `,
};
