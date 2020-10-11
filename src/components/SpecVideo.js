import { ref } from "../deps/vue.js";
import { Flussonic } from "../deps/flussonic.js";

import { useHls } from "../hooks/index.js";
import { specOutputUrl, specInputmUrl } from "../config/index.js";

export default {
  setup() {
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

    return {
      videoStarted,
      startVideo,
      stopVideo,
      specVideo,
    };
  },
  template: `
  <div
    style="
      grid-area: spec;
      height: 0;
      max-width: 100%;
      padding-bottom: 100%;
      position: relative;
    "
  >
    <div style="position: absolute; top: 0; right: 0; left: 0; bottom: 0; background: black">
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
  `,
};
