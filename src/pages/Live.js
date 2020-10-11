import { ref } from "../deps/vue.js";
import { useRoute } from "../deps/router.js";

import { useHls } from "../hooks/index.js";
import { fetchEvents, safeJsonParse } from "../utils/index.js";

import EventDetails from "../components/EventDetails.js";
import LegacyVideo from "../components/LegacyVideo.js";
import LegacyChat from "../components/LegacyChat.js";

import { mainInputUrl, chatUrl, eventsUrl } from "../config/index.js";

export default {
  components: { EventDetails, LegacyVideo, LegacyChat },
  setup() {
    const { params } = useRoute();

    // Set up main video input

    const mainVideo = useHls(mainInputUrl(params.id));

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
      const e = events.filter(({ id }) => {
        return id === params.id;
      });
      event.value = e[0];
      if (e[0] && e[0].color) {
        document.body.style.setProperty("background", e[0].color);
      }
    });

    return {
      clientsCount,
      mainVideo,
      event,
    };
  },
  template: `
  <div class="layout-live">
    <div
      class="flex"
    >
      <img src="../index.svg" style="width: 250px; display: block;" />
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

    <div style="grid-area: title; padding-top: 16px;">
      <event-details :event="event" />
    </div>
    <div style="grid-area: spec">
      <legacy-video></legacy-video>
    </div>
    <div style="grid-area: chat">
      <legacy-chat></legacy-chat>
    </div>
  </div>
  `,
};
