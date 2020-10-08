import { ref, onMounted, watch, watchEffect } from "../deps/vue.js";
import * as OpenviduBrowser from "https://cdn.skypack.dev/pin/openvidu-browser@v2.15.0-CFGUVrPQ7O8Ei4FETXw6/min/openvidu-browser.js";
const { OpenVidu } = OpenviduBrowser.default;
import { fetchAuth, randomId } from "../utils/index.js";

const VideoStream = {
  props: ["stream"],
  setup(props) {
    const videoEl = ref(null);
    watch(
      () => props.stream,
      (stream) => {
        if (stream) {
          stream.addVideoElement(videoEl.value);
        }
      }
    );
    return { videoEl };
  },
  template: `
    <video ref="videoEl" autoplay></video>
  `,
};

export default {
  components: { VideoStream },
  setup() {
    const publisher = ref(null);
    const subscribers = ref([]);

    const OV = new OpenVidu();
    //OV.enableProdMode();
    const session = OV.initSession();

    const url = "https://elektron.studio";
    const username = "OPENVIDUAPP";
    const password = "secret";

    session.on("streamCreated", ({ stream }) => {
      const subscriber = session.subscribe(stream);
      subscribers.value.push(subscriber);
      console.log(subscribers.value);
    });

    session.on("streamDestroyed", ({ stream }) => {
      const index = subscribers.value.indexOf(stream.streamManager, 0);
      if (index >= 0) {
        subscribers.value.splice(index, 1);
      }
    });

    fetchAuth({
      url: `${url}/api/sessions`,
      payload: { customSessionId: "hola" },
      username,
      password,
    }).then(({ id }) => {
      fetchAuth({
        url: `${url}/api/tokens`,
        payload: { session: id },
        username,
        password,
      }).then(({ token }) => {
        session.connect(token, { clientData: randomId() }).then(() => {
          const newPublisher = OV.initPublisher(null, {
            publishVideo: true,
            resolution: "320x240",
            frameRate: 15,
            insertMode: "APPEND",
            mirror: false,
          });
          session.publish(newPublisher);
          publisher.value = newPublisher;
        });
      });
    });
    return { publisher, subscribers };
  },
  template: `
  <div class="live-layout">
    <div style="grid-area: main">
      <video-stream :stream="publisher" />
      <p />
      <video-stream v-for="stream in subscribers" :stream="stream" />
    </div>
  </div>
  `,
};
