import { ref, watch } from "../deps/vue.js";

import Spinner from "../components/Spinner.js";

export default {
  components: { Spinner },
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
  <div
    style="
      position: relative;
      background: #333;
      width: 106px;
      height: 80px;
      margin: 0 0 1px 1px
    "
  >
    <div
      style="
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      "
    >
      <spinner style="width: 32px; height: 32px; opacity: 0.5" />
    </div>
    <video
      ref="videoEl"
      autoplay
      muted
      style="
        display: position; top: 0, right: 0; bottom: 0; left: 0
      "
    ></video>
  </div>
  `,
};
