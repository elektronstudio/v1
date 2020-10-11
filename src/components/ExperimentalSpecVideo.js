import { ref } from "../deps/vue.js";
import * as OpenviduBrowser from "https://cdn.skypack.dev/pin/openvidu-browser@v2.15.0-CFGUVrPQ7O8Ei4FETXw6/min/openvidu-browser.js";
const { OpenVidu } = OpenviduBrowser.default;
import { fetchAuth, randomId } from "../utils/index.js";

import VideoStream from "./VideoStream.js";

export default {
  components: { VideoStream },
  props: ["id"],
  setup(props) {
    const publisher = ref(null);
    const subscribers = ref([]);
    const videoStarted = ref(false);

    const OV = new OpenVidu();
    OV.enableProdMode();
    const session = OV.initSession();

    const url = "https://elektron.studio";
    const username = "OPENVIDUAPP";
    const password = "secret";

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

    const startVideo = () => {
      fetchAuth({
        url: `${url}/api/sessions`,
        payload: { customSessionId: props.id },
        username,
        password,
      }).then((data) => {
        const sessionId = data && data.id ? data.id : data.customSessionId;
        fetchAuth({
          url: `${url}/api/tokens`,
          payload: { session: sessionId },
          username,
          password,
        }).then(({ token }) => {
          session
            .connect(token, { clientData: { userName: randomId() } })
            .then(() => {
              const newPublisher = OV.initPublisher(null, {
                publishVideo: true,
                publishAudio: false,
                resolution: "80x60",
                frameRate: 12,
                mirror: true,
              });
              session.publish(newPublisher);
              publisher.value = newPublisher;
              videoStarted.value = true;
            });
        });
      });
    };

    const stopVideo = () => {
      session.disconnect();
      videoStarted.value = false;
    };

    return { publisher, subscribers, videoStarted, startVideo, stopVideo };
  },
  template: `
  <div
    style="
      position: relative;
      height: 300px;
      overflow: auto;
    "
  ><div
    v-show="videoStarted"
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
        background: rgba(20, 20, 20, 0.2);
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
