import { ref } from "../deps/vue.js";
import * as OpenviduBrowser from "https://cdn.skypack.dev/pin/openvidu-browser@v2.15.0-CFGUVrPQ7O8Ei4FETXw6/min/openvidu-browser.js";
const { OpenVidu } = OpenviduBrowser.default;
import { fetchAuth, randomId } from "../utils/index.js";
import { getToken } from "../utils/openvidu.js";
import { useLocalstorage } from "../hooks/index.js";

import VideoStream from "./VideoStream.js";

export default {
  components: { VideoStream },
  props: ["id"],
  setup(props) {
    const publisher = ref(null);
    const streamManager = ref(null);
    const subscribers = ref([]);
    const sessionStarted = ref(false);

    const userName = useLocalstorage("elektron_user_name", `hmm`);

    const OV = new OpenVidu();
    OV.enableProdMode();
    const session = OV.initSession();

    // const url = "https://elektron.studio";
    // const username = "OPENVIDUAPP";
    // const password = "secret";

    session.on("streamCreated", ({ stream }) => {
      const subscriber = session.subscribe(stream);
      subscribers.value.push(subscriber);
    });

    session.on("streamDestroyed", ({ stream }) => {
      const index = subscribers.value.indexOf(stream.streamManager, 0);
      if (index >= 0) {
        subscribers.value.splice(index, 1);
      }
    });

    const startSession = () => {
      getToken(props.id).then((token) => {
        session
          .connect(token, { clientData: { userName: userName.value } })
          .then(() => {
            const newPublisher = OV.initPublisher(null, {
              publishVideo: true,
              publishAudio: true,
              resolution: "80x60",
              frameRate: 12,
              mirror: true,
              insertMode: "APPEND",
            });
            session.publish(newPublisher);
            streamManager.value = newPublisher;
            publisher.value = newPublisher;
            sessionStarted.value = true;
          });
      });
    };

    const stopSession = () => {
      session.disconnect();
      sessionStarted.value = false;
      window.removeEventListener("beforeunload", stopSession);
    };

    window.addEventListener("beforeunload", stopSession);

    return {
      publisher,
      subscribers,
      sessionStarted,
      startSession,
      stopSession,
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
    v-show="sessionStarted"
    style="
      display: flex;
      flex-wrap: wrap;
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0
    ">
      <video-stream :stream="publisher" />
      <video-stream v-for="stream in subscribers" :stream="stream" />
    </div>
    <div
      v-show="!sessionStarted"
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
        <button @click="startSession">Start my camera</button>
      </div>
    </div>
    <div
      v-show="sessionStarted"
      style="
        position: absolute;
        right: 0;
        left: 0;
        bottom: 16px;
        text-align: center;
      "
    >
      <button v-if="sessionStarted" @click="stopSession">Stop my camera</button>
    </div>
  </div>
  `,
};
