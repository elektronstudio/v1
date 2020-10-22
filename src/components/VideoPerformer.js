import { ref } from "../deps/vue.js";
import { useHls } from "../hooks/index.js";

export default {
  props: {
    channel: {
      default: "test",
    },
  },
  setup(props) {
    const mainInputUrl =
      "https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8";

    const videoEl = useHls(mainInputUrl);

    const isPlaying = ref(true);
    const isMuted = ref(true);

    const play = () => {
      videoEl.value.play();
      isPlaying.value = true;
    };
    const pause = () => {
      videoEl.value.pause();
      isPlaying.value = false;
    };
    const mute = () => {
      //videoEl.value.volume = 0;
      isMuted.value = true;
    };
    const unmute = () => {
      //videoEl.value.volume = 1;
      isMuted.value = false;
    };
    const fullscreen = () => {
      videoEl.value.requestFullscreen();
    };
    return {
      videoEl,
      isPlaying,
      play,
      pause,
      isMuted,
      mute,
      unmute,
      fullscreen,
    };
  },
  template: `
    <div
      style="
        height: 0;
        max-width: 100%;
        padding-bottom: calc(9 / 16 * 100%);
        position: relative;
      "
    >
      <div style="position: absolute; top: 0; right: 0; left: 0; bottom: 0">
        <video ref="videoEl" autoplay :muted="isMuted"></video>
      </div>
      <div style="
        position: absolute;
        left: 8px;
        right: 8px;
        bottom: 8px;
        display: flex;
        justify-content: space-between;
      ">
        <button v-if="!isPlaying" @click="play">play</button>
        <button v-if="isPlaying" @click="pause">pause</button>
        <div>
          <button v-if="!isMuted" @click="mute">mute</button>
          <button v-if="isMuted" @click="unmute">unmute</button>
          &thinsp;
          <button @click="fullscreen">fullscreen</button>
        </div>
      </div>
    </div>
  `,
};
