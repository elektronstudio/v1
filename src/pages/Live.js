import { ref, onMounted } from "../deps/vue.js";
import { postscribe } from "../deps/postscribe.js";

import { useRoute } from "../../router.js";
import { useHls } from "../hooks/index.js";
import DatetimeLive from "../components/DatetimeLive.js";
import { uuidv4, fetchEvents, safeJsonParse } from "../utils/index.js";

// We use standard script tag import for Flussonic since it's not available in npm CDN

const { Publisher, PUBLISHER_EVENTS } = window.FlussonicWebRTC;

export default {
  components: { DatetimeLive },
  setup() {
    const { params } = useRoute();

    // Main video

    const mainUrl = `https://elektron-live.babahhcdn.com/bb1150-le/${params.id}/index.m3u8`;
    const mainVideo = useHls(mainUrl);

    // Specator video

    const specUrl =
      "https://elektron-live.babahhcdn.com/bb1150-le/spectators/index.m3u8";
    const specVideo = useHls(specUrl);

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
      <datetime-live v-if="event" :event="event"></datetime-live>
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
