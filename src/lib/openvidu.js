import { ref, computed } from "../deps/vue.js";
import { OpenVidu } from "../deps/openvidu-browser.js";

import { getToken, useUser } from "./index.js";

import { openviduWidth, openviduHeight, openviduFps } from "../../config.js";

export const useOpenvidu = (channel, autostart = false) => {
  const session = ref(null);
  const publisher = ref(null);
  const subscribers = ref([]);
  const { userId, userName } = useUser();

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

  const joinSession = () => {
    getToken(channel).then(({ token }) => {
      session.value
        .connect(token, { userId, userName })
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

  const sessionStarted = computed(() => publisher.value);

  return {
    sessionStarted,
    publisher,
    subscribers,
    joinSession,
    leaveSession,
  };
};
