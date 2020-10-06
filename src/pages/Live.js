import { ref, onMounted } from "../deps/vue.js";
import { useRoute } from "../deps/router.js";
import { Flussonic } from "../deps/flussonic.js";

import { useHls } from "../hooks/index.js";
import { uuidv4, fetchEvents, safeJsonParse } from "../utils/index.js";

import EventDetails from "../components/EventDetails.js";
import LegacyChat from "../components/LegacyChat.js";

export default {
  components: { EventDetails, LegacyChat },
  setup() {
    const { params } = useRoute();

    // URLS

    const mainInputUrl = `https://elektron-live.babahhcdn.com/bb1150-le/${params.id}/index.m3u8`;
    const specOutputUrl =
      "https://elektron-live.babahhcdn.com/bb1150-le/spectators/index.m3u8";
    const specInputmUrl =
      "wss://fo1.babahhcdn.com/elektron/" + uuidv4() + "?password=tron";
    const chatUrl = "wss://ws-fggq5.ondigitalocean.app";
    const eventsUrl =
      "https://www.googleapis.com/calendar/v3/calendars/mkr5k66b069hve1f7aa77m4bsc@group.calendar.google.com/events?key=AIzaSyAkeDHwQgc22TWxi4-2r9_5yMWVnLQNMXc";

    // Set up main video input

    const mainVideo = useHls(mainInputUrl);

    // Set up spectator video input

    const specVideo = useHls(specOutputUrl);
    const videoStarted = ref(false);

    // Set up spectator video output

    const { Publisher, PUBLISHER_EVENTS } = Flussonic;

    const publisher = new Publisher(specInputmUrl, {
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

    // Clients count

    const clientsCount = ref(false);

    const socket = new WebSocket(chatUrl);

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

    // Event

    const event = ref(null);
    fetchEvents(eventsUrl).then((events) => {
      const e = events.reverse().filter(({ id, diff }) => {
        return id === params.id;
      });
      event.value = e[0];
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
      <img src="../index.svg" style="width: 300px; display: block" />
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

    <div style="grid-area: title">
      <event-details :event="event" />
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
      <legacy-chat></legacy-chat>
    </div>
  </div>
  `,
};
