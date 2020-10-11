import { ref, watch } from "../deps/vue.js";

export default {
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
  <video
    ref="videoEl"
    autoplay
    muted
    style="
      background: #333;
      width: 80px;
      height: 60px;
      border: 1px solid black;
    "
  ></video>
  `,
};
