import { ref, onUnmounted } from "../deps/vue.js";

import { useHls, events } from "../lib/index.js";

import { mainInputUrl, experimentalInputUrl } from "../config/index.js";

import Logo from "../components/Logo.js";
import IconPlay from "../components/IconPlay.js";
import IconPause from "../components/IconPause.js";
import IconMute from "../components/IconMute.js";
import IconUnmute from "../components/IconUnmute.js";
import IconFullscreen from "../components/IconFullscreen.js";
import IconUnfullscreen from "../components/IconUnfullscreen.js";
import IconHeart from "../components/IconHeart.js";

export default {
  components: {
    Logo,
    IconPlay,
    IconPause,
    IconMute,
    IconUnmute,
    IconFullscreen,
    IconUnfullscreen,
    IconHeart,
  },
  props: {
    channel: {
      default: "test",
    },
    experimental: {
      default: false,
    },
  },
  setup(props) {
    const videoEl = useHls(
      props.experimental
        ? experimentalInputUrl(props.channel)
        : mainInputUrl(props.channel)
    );
    const playerEl = ref(null);

    const isPlaying = ref(true);
    const isMuted = ref(true);
    const showControls = ref(true);
    const isFullscreen = ref(false);

    const controlsTimeout = ref(null);
    const controlsShortDelay = 1000;
    const controlsLongDelay = 4000;

    const hideControls = () => {
      if (controlsTimeout.value) {
        clearTimeout(controlsTimeout.value);
      }
      controlsTimeout.value = setTimeout(
        () => (showControls.value = false),
        controlsLongDelay
      );
    };

    hideControls();

    const play = () => {
      videoEl.value.play();
      isPlaying.value = true;
      hideControls();
    };

    const pause = () => {
      videoEl.value.pause();
      isPlaying.value = false;
      hideControls();
    };

    const mute = () => {
      isMuted.value = true;
    };

    const unmute = () => {
      isMuted.value = false;
    };

    const fullscreen = () => {
      if (playerEl.value.requestFullscreen) {
        playerEl.value.requestFullscreen();
      } else {
        playerEl.value.webkitRequestFullscreen();
      }
      isFullscreen.value = true;
    };

    const unfullscreen = () => {
      document.exitFullscreen();
      isFullscreen.value = false;
    };

    const onShowControls = () => {
      showControls.value = true;
      hideControls();
    };

    const onHideControls = () => {
      if (isPlaying.value) {
        if (controlsTimeout.value) {
          clearTimeout(controlsTimeout.value);
        }
        controlsTimeout.value = setTimeout(
          () => (showControls.value = false),
          controlsShortDelay
        );
      }
    };

    onUnmounted(() => {
      if (controlsTimeout.value) {
        clearTimeout(controlsTimeout.value);
      }
    });

    const onSendHeart = () => events.emit("heart");

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
      isFullscreen,
      fullscreen,
      unfullscreen,
      onShowControls,
      onHideControls,
      onSendHeart,
    };
  },
  template: `<div
  ref="playerEl"
  style="
    height: 0;
    max-width: 100%;
    padding-bottom: calc(9 / 16 * 100%);
    position: relative;
  "
  @mousemove="onShowControls"
  @mouseleave="onHideControls"
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
        top: 0px;
        padding: 24px;
        display: flex;
        justify-content: space-between;
        background: linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0));
      "
    >
     
      <router-link to="/" style="cursor: w-resize"><logo /></router-link>
      <icon-heart style="stroke: red" @click="onSendHeart" />
    </div>
  </transition> 
  <transition name="fade">
    <div
      v-show="showControls"
      style="
        position: absolute;
        left: 0px;
        right: 0px;
        bottom: 0px;
        padding: 24px;
        display: flex;
        justify-content: space-between;
        background: linear-gradient(rgba(0,0,0,0), rgba(0,0,0,0.3))
      "
    >
      <icon-play v-if="!isPlaying" @click="play" />
      <icon-pause v-if="isPlaying" @click="pause" />
      <div>
        <icon-unmute v-if="!isMuted" @click="mute" />
        <icon-mute v-if="isMuted" @click="unmute" />
        &nbsp;
        &nbsp;
        {{ isFullsceen }}
        <icon-fullscreen v-if="!isFullscreen" @click="fullscreen" />
        <icon-unfullscreen v-if="isFullscreen" @click="unfullscreen" />
      </div>
    </div>
  </transition>
</div>
`,
};
