import { ref } from "../deps/vue.js";
import { useRoute } from "../deps/router.js";

import { useHls, useClientsCount } from "../hooks/index.js";
import { fetchEvents, safeJsonParse } from "../utils/index.js";

import LegacySpectatorsVideo from "../components/LegacySpectatorsVideo.js";
import Chat from "../components/Chat.js";
import LegacyChat from "../components/LegacyChat.js";
import EventDetails from "../components/EventDetails.js";

import { mainInputUrl, chatUrl, eventsUrl } from "../config/index.js";

export default {
  components: { EventDetails, LegacySpectatorsVideo, Chat, LegacyChat },
  setup() {
    const { params } = useRoute();

    // Set up main video input

    const mainVideo = useHls(mainInputUrl(params.id));

    // Set up clients count

    const clientsCount = useClientsCount();

    // Fetch and parse event

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
      <component :is="'legacy-spectators-video'" />
    </div>
    <div style="grid-area: chat">
      <component :is="'chat'" />
    </div>
  </div>
  `,
};
