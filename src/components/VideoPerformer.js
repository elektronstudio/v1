import { ref, onUnmounted } from "../deps/vue.js";
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
    const playerEl = ref(null);

    const isPlaying = ref(true);
    const isMuted = ref(true);
    const showControls = ref(true);

    const play = () => {
      videoEl.value.play();
      isPlaying.value = true;
    };
    const pause = () => {
      videoEl.value.pause();
      isPlaying.value = false;
    };
    const mute = () => {
      isMuted.value = true;
    };
    const unmute = () => {
      isMuted.value = false;
    };
    const fullscreen = () => {
      playerEl.value.requestFullscreen();
    };

    const controlsTimeout = ref(null);
    const controlsDelay = 1000;

    const onMouseover = () => {
      if (isPlaying.value) {
        if (controlsTimeout.value) {
          clearTimeout(controlsTimeout.value);
        }
        showControls.value = true;
      }
    };

    const onMouseout = () => {
      if (isPlaying.value) {
        if (controlsTimeout.value) {
          clearTimeout(controlsTimeout.value);
        }
        controlsTimeout.value = setTimeout(
          () => (showControls.value = false),
          controlsDelay
        );
      }
    };

    onUnmounted(() => {
      if (controlsTimeout.value) {
        clearTimeout(controlsTimeout.value);
      }
    });

    return {
      playerEl,
      videoEl,
      showControls,
      isPlaying,
      play,
      pause,
      isMuted,
      mute,
      unmute,
      fullscreen,
      onMouseover,
      onMouseout,
    };
  },
  template: `
    <div
      ref="playerEl"
      style="
        height: 0;
        max-width: 100%;
        padding-bottom: calc(9 / 16 * 100%);
        position: relative;
      "
      @mouseover="onMouseover"
      @mouseout="onMouseout"
    >
      <div style="position: absolute; top: 0; right: 0; left: 0; bottom: 0">
        <video ref="videoEl" autoplay :muted="isMuted"></video>
      </div>
      <transition name="fade">
        <div
          v-show="showControls"
          style="
            position: absolute;
            left: 0px;
            right: 0px;
            bottom: 0px;
            display: flex;
            justify-content: space-between;
            padding: 12px;
            background: linear-gradient(rgba(0,0,0,0) 0%, rgba(0,0,0,0.5) 100%);
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
      </transition>
    </div>
  `,
};
