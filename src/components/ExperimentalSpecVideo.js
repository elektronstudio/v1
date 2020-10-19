import { ref, computed } from "../deps/vue.js";
import * as OpenviduBrowser from "https://cdn.skypack.dev/pin/openvidu-browser@v2.15.0-CFGUVrPQ7O8Ei4FETXw6/min/openvidu-browser.js";
const { OpenVidu } = OpenviduBrowser.default;
import { getToken } from "../utils/index.js";

import { openviduWidth, openviduHeight, openviduFps } from "../config/index.js";

import PublisherVideoCard from "./PublisherVideoCard.js";

export default {
  components: {
    PublisherVideoCard,
  },
  props: ["id"],
  setup(props) {
    const session = ref(null);
    const publisher = ref(null);
    const subscribers = ref([]);
    const mySessionId = ref(props.id);
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

    const proportion = 4 / 3;
    const columns = computed(() =>
      Math.min(
        subscribers.value.length + 1,
        Math.round(Math.sqrt(proportion * subscribers.value.length + 1))
      )
    );
    // const rows = computed(() =>
    //   Math.ceil((subscribers.value.length + columns.value) / columns)
    // );

    return {
      session,
      publisher,
      subscribers,
      mySessionId,
      myUserName,
      joinSession,
      leaveSession,
      columns,
    };
  },
  template: `
  <div
    style="
      position: relative;
      overflow: auto;
    "
  ><div
    v-show="session"
    style="
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      display: grid;
      align-items: flex-start;
    "
    :style="{
      gridTemplateColumns: 'repeat(' + columns + ', 1fr)',
      gridAutoRows: 'max-content'
    }"
  >
    <publisher-video-card
      :publisher="publisher"
    />
    <publisher-video-card
      v-for="(publisher, i) in subscribers"
      :key="i"
      :publisher="publisher"
    />
    </div>
    <div
      v-show="!session"
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
        background: rgba(20, 20, 20, 0.2);
      "
    >
      <div>
        <p>
          Please allow access to your camera to be a
          public audience member in our venue. 
          Note that we do not use your microphone.
        </p>
        <button @click="joinSession">Start my camera</button>
      </div>
    </div>
    <div
      v-show="session"
      style="
        position: absolute;
        right: 0;
        left: 0;
        bottom: 16px;
        text-align: center;
      "
    >
      <button v-if="session" @click="leaveSession">Stop my camera</button>
    </div>
  </div>
  `,
};
