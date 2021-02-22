import { ref, computed, watch } from "../deps/vue.js";
import { useRoute } from "../deps/router.js";

import {
  useChannel,
  fetchEvents,
  getSheet,
  useSetInterval,
  useUser,
  useChat,
} from "../lib/index.js";

import { eventsUrl } from "../../config.js";

export default {
  setup() {
    const { params } = useRoute();
    const channel = params.channel;

    const { count } = useChannel(channel);

    // Fetch and parse event

    const event = ref(null);

    const sheetRows = ref([]);
    const sheetTitle = ref("");

    const get = () => {
      if (event.value && event.value.sheetid) {
        getSheet(event.value.sheetid).then(({ rows, title }) => {
          sheetRows.value = rows;
          sheetTitle.value = title;
        });
      }
    };

    get();

    useSetInterval(get, 1, event, 3000);

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

    const titleCase = (str) => {
      return str
        .toLowerCase()
        .split(" ")
        .map(function (word) {
          return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(" ");
    };

    const { likes, onLike } = useChat(channel);

    const sheetRowsWithLikes = computed(() =>
      sheetRows.value.map((row) => {
        const l = likes.value
          .map(({ value }) => value)
          .filter((value) => value === `${channel}-sheet-${row["id..."]}`);
        if (l.length) {
          row["likes..."] = l.length;
        }
        return row;
      })
    );

    const { userId } = useUser();

    const onSheetRowLike = (row) => {
      if (row["id..."]) {
        const id = `${channel}-sheet-${row["id..."]}`;
        onLike(id, userId.value);
      }
    };

    const activeChannel = ref(0);

    const channels = computed(() => {
      let c = [channel];
      if (event.value && event.value.id2) {
        c.push(event.value.id2);
      }
      if (event.value && event.value.id3) {
        c.push(event.value.id3);
      }
      if (event.value && event.value.id4) {
        c.push(event.value.id4);
      }
      return c;
    });

    return {
      activeChannel,
      channel,
      event,
      count,
      onToggleChat,
      chatVisible,
      cols,
      sheetRowsWithLikes,
      sheetTitle,
      titleCase,
      onSheetRowLike,
      channels,
    };
  },
  template: `
  <div class="layout-live" :style="{'--cols': cols}">
    <div style="grid-area: performer" style="">
      <template v-for="(ch, i) in channels">
        <performer-video v-show="activeChannel === i"  :channel="ch" />
      </template>
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
        <h4>{{ sheetTitle }}</h4>
      </div>
      <div
      style="
        height: 85vh;
        overflow: auto;
      ">
        <div v-for="row in sheetRowsWithLikes" style="margin-bottom: 24px" >
          <div style="
            padding: 0 0 0 16px;
            gap: 7px;
            font-size: 15px;
            line-height: 1.5em;
            borderLeft: 4px solid rgba(255,255,255,0.1);
          ">{{ likes }}
            <div
              v-for="(value, key, i) in row"
              v-show="value && !key.endsWith('...')"
              :style="{marginTop: i === 0 ? 0: '6px'}">
                <span v-if="value" style="opacity: 0.5;">{{ titleCase(key) }}</span>
                &ensp;
                <span v-if="value" style="">{{ value }}</span>
            </div>
            <div v-if="row['id...']" style="display: flex; font-size: 13px; margin-top: 4px;">
              <div style="cursor: pointer; color: #aaa" @click.prevent="onSheetRowLike(row)"><span :style="{opacity: row['likes...'] ? 1 : 0.3}">❤</span> <span style="opacity: 0.8">{{row['likes...']}}</span></div>
            </div>
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
        <div style="display: flex; align-items: baseline;">
          <h4 v-if="chatVisible">Chat</h4>
          &nbsp;&nbsp;
          <div style="opacity: 0.5; font-size: 0.9em">{{ count }} online</div>
        </div>
        <icon-to-left v-if="!chatVisible" />
        <icon-to-right v-if="chatVisible" />
      </div>
      <chat :channel="channel" v-if="chatVisible" />
    </div>
    <div
      v-if="event && event.hidden !== 'true'" 
      style="padding: 32px; grid-area: about">

      <div v-if="channels.length > 1" style="display: flex; gap: 8px; padding: 24px 0;">
        <button
          v-for="ch,i in channels"
          @click="activeChannel = i"
          :style="{background: 'rgba(0,0,0,0.)', opacity: i === activeChannel ? 1 : 0.5}"
        >
          {{ 'Camera ' + (i + 1)}}
        </button>
      </div>
      <event-details :event="event" />
    </div>
  </div>
  `,
};
