import { ref } from "../deps/vue.js";
import { Flussonic } from "../deps/flussonic.js";

import { useHls } from "../hooks/index.js";
import { specOutputUrl, specInputmUrl } from "../config/index.js";

import AspectRatio from "./AspectRatio.js";
import VideoConfirmation from "./VideoConfirmation.js";

export default {
  components: {
    AspectRatio,
    VideoConfirmation,
  },
  setup() {
    // Set up spectator video input

    const VideoAudienceMosaic = useHls(specOutputUrl);
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

    return {
      videoStarted,
      startVideo,
      stopVideo,
      VideoAudienceMosaic,
    };
  },
  template: `
  <aspect-ratio :ratio="1">
    <video-confirmation
      :started="videoStarted"
      @start="startVideo"
      @stop="stopVideo"
    >
      <video ref="VideoAudienceMosaic" autoplay muted></video>
    </video-confirmation>
  </aspect-ratio>
  `,
};