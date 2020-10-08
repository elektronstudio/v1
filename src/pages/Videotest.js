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
    const user = "OPENVIDUAPP";
    const secret = "secret";

    session.on("streamCreated", ({ stream }) => {
      const subscriber = session.subscribe(stream);
      subscribers.value.push(subscriber);
      console.log(a);
      console.log(subscribers.value);
    });

    session.on("streamDestroyed", ({ stream }) => {
      const index = subscribers.value.indexOf(stream.streamManager, 0);
      if (index >= 0) {
        subscribers.value.splice(index, 1);
      }
    });

    fetchAuth(
      `${url}/api/sessions`,
      { customSessionId: randomId() },
      user,
      secret
    ).then(({ id }) =>
      fetchAuth(`${url}/api/tokens`, { session: id }, user, secret).then(
        ({ token }) => {
          session.connect(token).then(() => {
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
        }
      )
    );
    watchEffect(() => console.log(subscribers.value));
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
