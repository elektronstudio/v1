import { ref, computed } from "../deps/vue.js";
import * as OpenviduBrowser from "https://cdn.skypack.dev/pin/openvidu-browser@v2.15.0-CFGUVrPQ7O8Ei4FETXw6/min/openvidu-browser.js";
const { OpenVidu } = OpenviduBrowser.default;

import { getToken, useUser } from "../lib/index.js";

import { openviduWidth, openviduHeight, openviduFps } from "../../config.js";

export default {
  props: {
    channel: {
      default: "test",
    },
    ratio: {
      default: 1,
    },
  },
  setup(props) {
    const session = ref(null);
    const publisher = ref(null);
    const subscribers = ref([]);
    const { userId, userName } = useUser();

    const joinSession = () => {
      const OV = new OpenVidu();

      session.value = OV.initSession();

      session.value.on("streamCreated", ({ stream }) => {
        const subscriber = session.value.subscribe(stream);
        subscribers.value.push(subscriber);
      });

      session.value.on("streamDestroyed", ({ stream }) => {
        const index = subscribers.value.indexOf(stream.streamManager);
        if (index >= 0) {
          subscribers.value.splice(index, 1);
        }
      });

      getToken(props.channel).then(({ token }) => {
        session.value
          .connect(token, { userName })
          .then(() => {
            let newPublisher = OV.initPublisher(null, {
              publishVideo: true,
              publishAudio: true,
              resolution: `${openviduWidth}x${openviduHeight}`,
              frameRate: openviduFps,
              insertMode: "APPEND",
              mirror: false,
            });

            publisher.value = newPublisher;
            session.value.publish(newPublisher);
          })
          .catch((e) => console.log(e));
      });
    };

    const leaveSession = () => {
      session.value.disconnect();
      session.value = null;
      publisher.value = null;
      subscribers.value = [];
      window.removeEventListener("beforeunload", leaveSession);
    };

    window.addEventListener("beforeunload", leaveSession);

    const sessionStarted = computed(() => !!session.value);

    return {
      sessionStarted,
      publisher,
      subscribers,
      joinSession,
      leaveSession,
    };
  },
  template: `
    <aspect-ratio :ratio="ratio">
      <video-confirmation
        :started="sessionStarted"
        @start="joinSession"
        @stop="leaveSession"
      >
        <video-grid>
          <openvidu-video
            :publisher="publisher"
          />
          <openvidu-video
            v-for="(publisher, i) in subscribers"
            :key="i"
            :publisher="publisher"
          />
        </video-grid>
      </video-confirmation>
    </aspect-ratio>
    
  `,
};
