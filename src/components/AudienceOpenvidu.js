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
    const openvidu = useOpenvidu(props.channel, false);
    return openvidu;
  },
  template: `
    <aspect-ratio :ratio="ratio">
      <video-confirmation
        :started="sessionStarted"
        @start="joinSession"
        @stop="leaveSession"
        opacity="0"
        message=""
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
