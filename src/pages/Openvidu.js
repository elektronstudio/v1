import { computed, ref, onMounted } from "../deps/vue.js";

import axios from "https://cdn.skypack.dev/pin/axios@v0.20.0-LOBv4rtrPNcfEDCm7t9v/min/axios.js";
import * as OpenviduBrowser from "https://cdn.skypack.dev/pin/openvidu-browser@v2.15.0-CFGUVrPQ7O8Ei4FETXw6/min/openvidu-browser.js";
const { OpenVidu } = OpenviduBrowser.default;
import { getToken } from "../utils/index.js";

axios.defaults.headers.post["Content-Type"] = "application/json";

//const OPENVIDU_SERVER_URL = "https://" + location.hostname + ":4443";
// const OPENVIDU_SERVER_URL = "https://elektron.studio";
// const OPENVIDU_SERVER_SECRET = "secret";

const PublisherVideo = {
  props: ["publisher"],
  setup(props) {
    const video = ref(null);
    onMounted(() => props.publisher.addVideoElement(video.value));
    return { video };
  },
  template: `
    <video ref="video" muted autoplay />
  `,
};

export const PublisherCard = {
  components: {
    PublisherVideo,
  },
  props: ["publisher"],
  setup(props) {
    const clientData = computed(() => {
      if (props.publisher) {
        const { connection } = props.publisher.stream;
        return JSON.parse(connection.data);
      }
      return { userName: null };
    });
    return { clientData };
  },
  template: `
  <div>
	  <publisher-video v-if="publisher" :publisher="publisher"/>
	  <div>{{ clientData.userName }}</div>
  </div>
  `,
};

export default {
  components: {
    PublisherCard,
  },

  setup() {
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
  <div id="main-container" class="container">
    <div id="join" v-if="!session">
      <div id="img-div">
        <img src="resources/images/openvidu_grey_bg_transp_cropped.png" />
      </div>
      <div id="join-dialog" class="jumbotron vertical-center">
        <h1>Join a video session</h1>
        <form class="form-group" @submit="joinSession">
          <p>
            <label>Participant</label>
            <input
              v-model="myUserName"
              class="form-control"
              type="text"
              required
            />
          </p>
          <p>
            <label>Session {{ mySessionId }}</label>
            <input
              v-model="mySessionId"
              class="form-control"
              type="text"
              required
            />
          </p>
          <p class="text-center">
            <input
              class="btn btn-lg btn-success"
              type="submit"
              name="commit"
              value="Join!"
            />
          </p>
        </form>
      </div>
    </div>
    <div id="session" v-if="session">
      <div id="session-header">
        <h1 id="session-title">{{ mySessionId }}</h1>
        <input
          class="btn btn-large btn-danger"
          type="button"
          id="buttonLeaveSession"
          @click="leaveSession"
          value="Leave session"
        />
      </div>
      <div id="main-video" class="col-md-6">
        <!-- <subscriber-card :subscriber="mainStreamManager" /> -->
      </div>
      <div id="video-container" class="col-md-6">
        <publisher-card
          :publisher="publisher"
        />
        <publisher-card
          v-for="(publisher, index) in subscribers"
          :key="index"
          :publisher="publisher"
        />
      </div>
    </div>
  </div>
  `,
};
