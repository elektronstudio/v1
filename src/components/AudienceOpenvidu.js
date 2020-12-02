// import { ref, computed } from "../deps/vue.js";
// import * as OpenviduBrowser from "https://cdn.skypack.dev/pin/openvidu-browser@v2.15.0-CFGUVrPQ7O8Ei4FETXw6/min/openvidu-browser.js";
// const { OpenVidu } = OpenviduBrowser.default;

// import { openviduWidth, openviduHeight, openviduFps } from "../../config.js";

import { useOpenvidu } from "../lib/index.js";

export default {
  props: {
    channel: {
      default: "test",
    },
    ratio: {
      default: 1,
    },
  },
  setup(props) {
    const openvidu = useOpenvidu(props.channel);
    return openvidu;
  },
  template: `
    <aspect-ratio :ratio="ratio">
      <video-confirmation
        :started="sessionStarted"
        @start="joinSession"
        @stop="leaveSession"
      >
        <video-grid>
          <openvidu-video
            :publisher="publisher"
          />
          <openvidu-video
            v-for="(publisher, i) in subscribers"
            :key="i"
            :publisher="publisher"
          />
        </video-grid>
      </video-confirmation>
    </aspect-ratio>
    
  `,
};
