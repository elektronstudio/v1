import VideoAudienceMosaic from "../components/VideoAudienceMosaic.js";
import VideoAudienceImages from "../components/VideoAudienceImages.js";
import VideoAudienceOpenvidu from "../components/VideoAudienceOpenvidu.js";

export default {
  components: {
    VideoAudienceMosaic,
    VideoAudienceImages,
    VideoAudienceOpenvidu,
  },
  setup() {
    return { log: console.log };
  },
  template: `
  <div class="layout-videotest">
    <div><video-audience-mosaic id="test" /><p><br/> Original  WebRTC + server video stitching (huge initial lag, medium update lag, very big number of participants. No audio support)</p></div>
    <div><video-audience-images /><p><br/>Sending video still frames via websocket (small initial lag, 1sec update lag, medium number of participants). No audio support</p></div>
    <div><video-audience-openvidu id="test" /><p><br/> WebRTC based on OpenVidu (minimum initial lag, minimum update lag, limited number of participants. Has audio support)</p></div>
  </div>
  `,
};
