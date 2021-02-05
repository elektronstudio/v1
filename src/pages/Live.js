import { ref, computed, watch } from "../deps/vue.js";
import { useRoute } from "../deps/router.js";

import {
  useChannel,
  fetchEvents,
  getSheet,
  useSetInterval,
} from "../lib/index.js";

import { eventsUrl } from "../../config.js";

export default {
  setup() {
    const { params } = useRoute();
    const channel = params.channel;

    const { count } = useChannel(channel);

    // Fetch and parse event

    const event = ref(null);

    const sheet = ref([]);

    useSetInterval(
      () => {
        if (event.value.sheetid) {
          getSheet(event.value.sheetid).then((s) => (sheet.value = s));
        }
      },
      1,
      event,
      1000
    );

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
          audience: "enabled",
          chat: "enabled",
          hidden: false,
        };
      }
    });

    // Chat

    const chatVisible = ref(true);

    // watch(
    //   chatVisible,
    //   (visible) => {
    //     document.body.style.setProperty(
    //       "--cols",
    //       visible ? "1fr 350px 300px" : "1fr 350px 40px"
    //     );
    //   },
    //   { immediate: true }
    // );

    const onToggleChat = () => {
      chatVisible.value = !chatVisible.value;
    };

    const performerWidth = "1fr";
    const audienceWidth = "350px";
    const chatWidth = "300px";

    const cols = computed(() => {
      const cols = [
        "1fr",
        event.value && event.value.audience !== "disabled" ? "auto" : "0",
        event.value && event.value.chat !== "disabled" ? "auto" : "0",
      ]
        .map((c) => c)
        .join(" ");
      return cols;
    });

    const activeChannel = ref(0);
    return {
      activeChannel,
      channel,
      event,
      count,
      onToggleChat,
      chatVisible,
      cols,
      sheet,
    };
  },
  template: `
  <div class="layout-live" :style="{'--cols': cols}">
    <div style="grid-area: performer">
      <performer-video v-show="activeChannel === 0 && event" :channel="channel" />
      <!-- <performer-video v-show="activeChannel === 1 && event && event.id2" :channel="event.id2" /> -->
      <div v-if="event && event.id2" style="display: flex; gap: 8px; padding: 24px;">
        <button
          v-for="c in [0,1]"
          @click="activeChannel = c"
          :style="{opacity: c === activeChannel ? 1 : 0.5}"
        >
          {{ 'Camera ' + (c + 1)}}
        </button>
      </div>
      
    </div>
    <div
      v-if="event && event.audience !== 'disabled' && !event.sheetid"
      class="panel-audience"
      style="
        grid-area: audience;
        width: 350px;
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
      v-if="event && event.sheetid"
      class="panel-audience"
      style="
        grid-area: audience;
        width: 350px;
        background: rgba(255,255,255,0.075);
      "
    >
      <div class="flex-justified" style="margin-bottom: 16px; min-height: 32px;">
        <h4>Sheet</h4>
        <div style="opacity: 0.5">{{ count }} online</div>
      </div>
      <div
      style="
        height: 70vh;
        overflow: auto;
      ">
        <div v-for="row in sheet" style="margin-bottom: 24px" >
          <div>
            <div v-for="(value, key) in row">{{ key }} / {{ value }}</div>
          </div>
        </div>
      </div>
    </div>
    <div
      v-if="event && event.chat !== 'disabled'"
      class="panel-chat"
      style="
        grid-area: chat;
        background: rgba(255,255,255,0.15);
      "
      :style="{
        padding: chatVisible ? '24px' : '24px 10px',
        width: chatVisible ? '300px' : '40px'
      }"
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
    <div
      v-if="event && event.hidden !== 'true'" 
      style="padding: 32px; grid-area: about">
      <event-details :event="event" />
    </div>
  </div>
  `,
};
