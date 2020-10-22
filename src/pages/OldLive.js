import { ref, computed } from "../deps/vue.js";
import { useRoute } from "../deps/router.js";

import { useHls, useClientsCount } from "../hooks/index.js";
import { fetchEvents } from "../utils/index.js";

import VideoAudienceMosaic from "../components/VideoAudienceMosaic.js";
import VideoAudienceImages from "../components/VideoAudienceImages.js";
import VideoAudienceOpenvidu from "../components/VideoAudienceOpenvidu.js";
import ChatAudienceEmbed from "../components/ChatAudienceEmbed.js";
import ChatAudienceMessages from "../components/ChatAudienceMessages.js";
import EventDetails from "../components/EventDetails.js";

import { mainInputUrl, chatUrl, eventsUrl } from "../config/index.js";

export default {
  components: {
    EventDetails,
    VideoAudienceMosaic,
    VideoAudienceImages,
    VideoAudienceOpenvidu,
    ChatAudienceEmbed,
    ChatAudienceMessages,
  },
  setup() {
    const { params } = useRoute();
    const channel = params.channel;

    // Set up main video input

    const mainVideo = useHls(mainInputUrl(channel));

    // Set up clients count

    const clientsCount = useClientsCount();

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
    });

    const audienceComponent = computed(() => {
      const audienceComponents = {
        mosaic: "VideoAudienceMosaic",
        images: "VideoAudienceImages",
        openvidu: "VideoAudienceOpenvidu",
      };
      if (
        event.value &&
        event.value.audience &&
        audienceComponents[event.value.audience]
      ) {
        return audienceComponents[event.value.audience];
      }
      return audienceComponents.mosaic;
    });

    return {
      clientsCount,
      mainVideo,
      event,
      channel,
      audienceComponent,
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
      <component :is="audienceComponent" :channel="channel" />
    </div>
    <div style="grid-area: chat">
      <chat-audience-messages :channel="channel" />
    </div>
  </div>
  `,
};
