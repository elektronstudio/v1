import { ref } from "../deps/vue.js";
import * as OpenviduBrowser from "https://cdn.skypack.dev/pin/openvidu-browser@v2.15.0-CFGUVrPQ7O8Ei4FETXw6/min/openvidu-browser.js";
const { OpenVidu } = OpenviduBrowser.default;
import { getToken } from "../utils/index.js";

import { PublisherCard } from "../pages/OpenVidu.js";

export default {
  components: {
    PublisherCard,
  },
  props: ["id"],
  setup(props) {
    const session = ref(null);
    const publisher = ref(null);
    const subscribers = ref([]);
    const mySessionId = ref("SessionA");
    const myUserName = ref("Participant" + Math.floor(Math.random() * 100));

    const joinSession = () => {
      const OV = new OpenVidu();

      session.value = OV.initSession();

      session.value.on("streamCreated", ({ stream }) => {
        const subscriber = session.value.subscribe(stream);
        subscribers.value.push(subscriber);
      });

      session.value.on("streamDestroyed", ({ stream }) => {
        console.log("des");
        const index = subscribers.value.indexOf(stream.streamManager, 0);
        if (index >= 0) {
          subscribers.value.splice(index, 1);
        }
      });

      getToken(mySessionId.value).then(({ token }) => {
        session.value
          .connect(token, { userName: myUserName.value })
          .then(() => {
            let newPublisher = OV.initPublisher(undefined, {
              audioSource: undefined,
              videoSource: undefined,
              publishAudio: true,
              publishVideo: true,
              resolution: "160x120",
              frameRate: 12,
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
      window.removeEventListener("beforeunload", leaveSession);
    };

    window.addEventListener("beforeunload", leaveSession);

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
  <div
    style="
      position: relative;
      height: 300px;
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
      grid-template-columns: 1fr 1fr 1fr;
      align-items: flex-start;
      gap: 1px;
  ">
    <div v-for="i in 10" style="background: yellow; height: 100%;">a</div>
    <!-- <publisher-card
      :publisher="publisher"
    />
    <publisher-card
      v-for="(publisher, i) in subscribers"
      :key="i"
      :publisher="publisher"
    /> -->
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
