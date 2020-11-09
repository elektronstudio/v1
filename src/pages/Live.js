import { ref, computed, watch } from "../deps/vue.js";
import { useRoute } from "../deps/router.js";

import {
  fetchEvents,
  randomId,
  any,
  adjectives,
  animals,
  useState,
  useClientsCount,
  useLocalstorage,
} from "../lib/index.js";

import { eventsUrl } from "../config/index.js";

export default {
  setup() {
    const userId = useLocalstorage("elektron_user_id", randomId());
    const userName = useLocalstorage(
      "elektron_user_name",
      `${any(adjectives)} ${any(animals)}`
    );

    const { params } = useRoute();
    const channel = params.channel;

    const clientsCount = useClientsCount(channel, userId, userName);

    const experimental = ref(false);

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
      if (event.value && event.value.experimental) {
        experimental.value = true;
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
      clientsCount,
      onToggleChat,
      chatVisible,
      experimental,
    };
  },
  template: `
  <div class="layout-test">
    <div style="grid-area: performer">
      <video-performer v-if="event" :channel="channel" :experimental="experimental" />
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
      <component :is="experimental ? 'video-audience-images' : 'video-audience-post-images'" :channel="channel" :ratio="1 / 2" />
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
