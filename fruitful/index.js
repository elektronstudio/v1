import {
  createApp,
  ref,
  onMounted,
  computed,
} from "https://unpkg.com/vue@3.0.0/dist/vue.esm-browser.prod.js";
import postscribe from "https://cdn.skypack.dev/postscribe";
import Hls from "https://cdn.skypack.dev/hls.js";
import TurndownService from "https://cdn.skypack.dev/pin/turndown@v6.0.0-qC3MfTphTfj9zgLFS0WD/min/turndown.js";
import marked from "https://cdn.skypack.dev/pin/marked@v1.1.1-iZqTGJZXK3XAWXf76Ped/min/marked.js";
import {
  format,
  compareAsc,
  compareDesc,
  differenceInHours,
  formatDistanceToNowStrict,
} from "https://cdn.skypack.dev/pin/date-fns@v2.16.1-bghq1qKsQxU85Me2Z8iI/min/date-fns.js";

// We use standard script tag import for Flussonic since it's not available in npm CDN

const { Publisher, PUBLISHER_EVENTS, PLAYER_EVENTS } = window.FlussonicWebRTC;

// Setup

const eventId = window.location.pathname.slice(1).split("/")[0];

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
    .then(({ items }) => items.map(parseEvent));
};

const useHls = (url) => {
  const el = ref(null);
  onMounted(() => {
    if (Hls.isSupported()) {
      const hls = new Hls({
        manifestLoadingRetryDelay: 5000,
        manifestLoadingMaxRetry: Infinity,
      });
      hls.attachMedia(el.value);
      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        hls.loadSource(url);
      });
    }
  });
  return el;
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

// App

const App = {
  components: { Datetime },
  setup() {
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

    const testUrl = `https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8`;

    const mainUrl = `https://elektron-live.babahhcdn.com/bb1150-le/emp/index.m3u8`;
    const specUrl =
      "https://elektron-live.babahhcdn.com/bb1150-le/spectators/index.m3u8";

    const mainVideo = useHls(mainUrl);
    const specVideo = useHls(specUrl);

    const event = ref(null);
    fetchEvents().then((events) => {
      event.value = events.filter(({ id }) => id === eventId)[0];
    });

    return {
      videoStarted,
      startVideo,
      stopVideo,
      clientsCount,
      mainVideo,
      specVideo,
      event,
    };
  },
};

const app = createApp(App);
//app.component("test", Test);
app.mount("#app");
