import { ref, computed } from "../deps/vue.js";
import * as OpenviduBrowser from "https://cdn.skypack.dev/pin/openvidu-browser@v2.15.0-CFGUVrPQ7O8Ei4FETXw6/min/openvidu-browser.js";
const { OpenVidu } = OpenviduBrowser.default;
import { getToken } from "../utils/index.js";

import { openviduWidth, openviduHeight, openviduFps } from "../config/index.js";

import VideoGrid from "./VideoGrid.js";
import PublisherVideoCard from "./PublisherVideoCard.js";
import AspectRatio from "./AspectRatio.js";
import VideoConfirmation from "./VideoConfirmation.js";

export default {
  components: {
    VideoGrid,
    PublisherVideoCard,
    AspectRatio,
    VideoConfirmation,
  },
  setup(props) {
    const session = ref(null);
    const publisher = ref(null);
    const subscribers = ref([]);
    const mySessionId = ref("test");
    const myUserName = ref("Participant" + Math.floor(Math.random() * 100));

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

      getToken(mySessionId.value).then(({ token }) => {
        session.value
          .connect(token, { userName: myUserName.value })
          .then(() => {
            let newPublisher = OV.initPublisher(null, {
              publishVideo: true,
              publishAudio: false,
              resolution: `${openviduWidth}x${openviduHeight}`,
              frameRate: openviduFps,
              insertMode: "APPEND",
              mirror: false,
            });

            publisher.value = newPublisher;
            session.value.publish(newPublisher);
          })
          .catch((error) => {
            console.log(
              "There was an error connecting to the session:",
              error.code,
              error.message
            );
          });
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

    // https://stackoverflow.com/a/51956837

    return {
      session,
      publisher,
      subscribers,
      mySessionId,
      myUserName,
      joinSession,
      leaveSession,
    };
  },
  template: `
    <aspect-ratio :ratio="1">
      <video-confirmation
        :started="session"
        @start="joinSession"
        @stop="leaveSession"
      >
        <video-grid>
          <publisher-video-card
            :publisher="publisher"
          />
          <publisher-video-card
            v-for="(publisher, i) in subscribers"
            :key="i"
            :publisher="publisher"
          />
        </video-grid>
      </video-confirmation>
    </aspect-ratio>
    
  `,
};
