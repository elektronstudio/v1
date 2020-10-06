import { ref, onMounted, computed } from "../deps/vue.js";
import postscribe from "https://cdn.skypack.dev/postscribe";
import TurndownService from "https://cdn.skypack.dev/pin/turndown@v6.0.0-qC3MfTphTfj9zgLFS0WD/min/turndown.js";
import marked from "https://cdn.skypack.dev/pin/marked@v1.1.1-iZqTGJZXK3XAWXf76Ped/min/marked.js";
import {
  format,
  compareAsc,
  differenceInHours,
  formatDistanceToNowStrict,
} from "https://cdn.skypack.dev/pin/date-fns@v2.16.1-bghq1qKsQxU85Me2Z8iI/min/date-fns.js";

import { useRoute } from "../../router.js";

import { useHls } from "../hooks/index.js";

// We use standard script tag import for Flussonic since it's not available in npm CDN

const { Publisher, PUBLISHER_EVENTS, PLAYER_EVENTS } = window.FlussonicWebRTC;

// Json utils

function safeJsonParse(str) {
  try {
    return JSON.parse(str);
  } catch (err) {
    return null;
  }
}

// Id utils

function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Date utils

const isDatetime = (str) => String(str).match(/:/g);

const getDifference = (start, end) => {
  const diffStart = differenceInHours(new Date(start), new Date());
  const diffEnd = differenceInHours(new Date(end), new Date());
  //return `${diffStart} ${diffEnd}`;
  if (isDatetime(diffEnd) && diffEnd <= 0) {
    return "past";
  } else if (!isDatetime(diffEnd) && diffStart <= 0) {
    return "past";
  } else if (isDatetime(diffEnd) && diffStart <= 0 && diffEnd > 0) {
    return "now";
  } else if (diffStart <= 12) {
    return "soon";
  } else {
    return "future";
  }
};

const formatDate = (str) => {
  if (isDatetime(str)) {
    return format(new Date(str), "d. MMM y HH:mm");
  } else {
    return format(new Date(str), "d. MMM y");
  }
};

const formatAgo = (str) => {
  const diff = differenceInHours(new Date(str), new Date());
  return `${diff >= 0 ? "In " : ""} ${formatDistanceToNowStrict(
    new Date(str)
  )} ${diff < 0 ? "ago" : ""}`;
};

// Content utils

const turndown = new TurndownService();

const parseEvent = (event) => {
  const summary = event.summary ? event.summary.trim() : "";
  const start = event.start.date
    ? event.start.date
    : event.start.dateTime
    ? event.start.dateTime
    : "";
  const end = event.end.date
    ? event.end.date
    : event.end.dateTime
    ? event.end.dateTime
    : "";

  const markdown = turndown.turndown(event.description || "");
  const description = event.description ? marked(markdown) : "";

  const teaser = event.description ? marked(markdown.split("\n\n")[0]) : "";

  const ids = markdown.match(/(\n\r?id:\s?)(.*)/);
  const id = ids && ids[2] ? ids[2] : "";
  const youtubes = markdown.match(/(\n\r?youtube:\s?)(.*)/);
  const youtube = youtubes && youtubes[2] ? youtubes[2] : "";

  const diff = getDifference(start, end);
  return { summary, description, teaser, id, start, end, diff, youtube };
};

const fetchEvents = () => {
  const url =
    "https://www.googleapis.com/calendar/v3/calendars/mkr5k66b069hve1f7aa77m4bsc@group.calendar.google.com/events?key=AIzaSyAkeDHwQgc22TWxi4-2r9_5yMWVnLQNMXc";

  return fetch(url)
    .then((res) => res.json())
    .then(({ items }) =>
      items
        .map(parseEvent)
        .sort((a, b) => compareAsc(new Date(a.start), new Date(b.start)))
    );
};

// Components

const Datetime = {
  props: ["event"],
  setup() {
    const color = computed(() =>
      event && (event.diff == "soon" || event.diff == "now") ? "red" : "inherit"
    );
    return { color, formatAgo, formatDate };
  },
  template: `
   <h4>
    ⏰
    <span :style="{ color }">
      {{ formatAgo(event.start) }}
    </span>
    <br />
    <span style="opacity:0.7">
      {{ formatDate(event.start) }} → {{ formatDate(event.end) }}
    </span>
  </h4>
  `,
};

export default {
  components: { Datetime },
  setup() {
    const { params } = useRoute();

    // Audience video

    const videoStarted = ref(false);

    const streamWSS =
      "wss://fo1.babahhcdn.com/elektron/" + uuidv4() + "?password=tron";

    const publisher = new Publisher(streamWSS, {
      previewOptions: {
        autoplay: true,
        controls: false,
        muted: true,
      },
      constraints: {
        video: true,
        audio: true,
      },
    });

    publisher.on(PUBLISHER_EVENTS.STREAMING, () => {
      console.log("Streaming started");
    });

    const startVideo = () => {
      videoStarted.value = true;
      publisher.start();
    };

    const stopVideo = () => {
      videoStarted.value = false;
      publisher.stop();
    };

    // Chat

    onMounted(() =>
      postscribe(
        "#chat",
        `<script
      id="cid0020000246593815710"
      data-cfasync="false"
      async
      src="//st.chatango.com/js/gz/emb.js"
      style="width: 100%; height: 280px"
    >
      {
        "handle":"elektronlivetest",
        "arch":"js",
        "styles":{
          "a":"000000",
          "b":100,
          "c":"FFFFFF",
          "d":"000000",
          "e":"000000",
          "g": "ffffff",
          "h":"999999",
          "k":"222222",
          "l":"000000",
          "m":"aaaaaa",
          "n":"aaaaaa",
          "p":"12",
          "q":"000000",
          "r":100,
          "t":40,
          "usricon":0,
          "allowpm":0,
          "cnrs":"0"
        }
      }
    </script>`
      )
    );

    // Clients count

    const clientsCount = ref(false);

    const socket = new WebSocket("wss://ws-fggq5.ondigitalocean.app/");

    let interval = null;

    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "statsRequest" }));
      interval = setInterval(
        () => socket.send(JSON.stringify({ type: "statsRequest" })),
        8000
      );
    };

    socket.onmessage = ({ data }) => {
      const message = safeJsonParse(data);
      if (message && message.type === "statsResponse") {
        clientsCount.value = message.clientsCount;
      }
    };

    socket.onclose = () => clearInterval(interval);

    // Videos

    const testUrl = `https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8`;
    const mainUrl = `https://elektron-live.babahhcdn.com/bb1150-le/${params.id}/index.m3u8`;
    const specUrl =
      "https://elektron-live.babahhcdn.com/bb1150-le/spectators/index.m3u8";

    const mainVideo = useHls(mainUrl);
    const specVideo = useHls(specUrl);

    // Events

    const event = ref(null);
    fetchEvents().then((events) => {
      const e = events.filter(({ id, diff }) => {
        return id === params.id;
      });
      event.value = e[0];
    });

    const isSummary = ref(false);

    return {
      videoStarted,
      startVideo,
      stopVideo,
      clientsCount,
      mainVideo,
      specVideo,
      event,
      isSummary,
    };
  },
  template: `
  <div class="layout-live">
    <div
      style="
        display: flex;
        align-items: center;
        grid-area: logo;
        padding: 8px 0;
      "
    >
      <img src="index.svg" style="width: 300px; display: block" />
      &nbsp;&nbsp;&nbsp;
      <router-link to="/"><div class="pill-gray">← Back to schedule</div></router-link>
    </div>
    <div
      style="
        display: flex;
        justify-content: flex-end;
        align-items: center;
        grid-area: count;
      "
    >
      <h3 v-show="clientsCount > 0">
        {{ clientsCount }} live viewer{{ clientsCount > 1 ? 's' : ''}}
      </h3>
    </div>

    <div
      style="
        grid-area: main;
        height: 0;
        max-width: 100%;
        padding-bottom: calc(9 / 16 * 100%);
        position: relative;
      "
    >
      <div style="position: absolute; top: 0; right: 0; left: 0; bottom: 0">
        <video ref="mainVideo" controls autoplay muted></video>
      </div>
    </div>

    <div style="grid-area: title; padding-right: 16px">
      <datetime v-if="event" :event="event"></datetime>
      <p style="margin-bottom: 8px"></p>
      <h3>{{ event ? event.summary : '' }}</h3>
      <p style="margin-bottom: 8px"></p>
      <div
        v-if="!isSummary"
        @click="isSummary = !isSummary"
        style="cursor: pointer"
        class="pill-gray"
      >
        More info
      </div>
      <div
        v-if="isSummary"
        style="opacity: 0.7"
        v-html="event ? event.description : ''"
      ></div>
    </div>
    <div
      style="
        grid-area: spec;
        height: 0;
        max-width: 100%;
        padding-bottom: calc(3 / 4 * 100%);
        position: relative;
      "
    >
      <div style="position: absolute; top: 0; right: 0; left: 0; bottom: 0">
        <video ref="specVideo" autoplay muted></video>
      </div>
      <div
        v-show="!videoStarted"
        style="
          position: absolute;
          top: 0;
          right: 0;
          left: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 0 32px;
          background: rgba(20, 20, 20, 0.9);
        "
      >
        <div>
          <p>
            Please allow access to your camera. By saying YES you become a
            public audience member in our venue!
          </p>
          <button @click="startVideo">Start my camera</button>
        </div>
      </div>
      <div
        v-show="videoStarted"
        style="
          position: absolute;
          right: 0;
          left: 0;
          bottom: 16px;
          text-align: center;
        "
      >
        <button @click="stopVideo">Stop my camera</button>
      </div>
    </div>
    <div style="grid-area: chat">
      <div id="chat"></div>
    </div>
  </div>
  `,
};
