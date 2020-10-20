import VideoAudienceImages from "../components/VideoAudienceImages.js";
import SpecVideo from "../components/SpecVideo.js";
import VideoAudienceWebrtc from "../components/VideoAudienceWebrtc.js";
import VideoGrid from "../components/VideoGrid.js";
import VideoConfirmation from "../components/VideoConfirmation.js";
import AspectRatio from "../components/AspectRatio.js";

export default {
  components: {
    VideoGrid,
    VideoAudienceImages,
    SpecVideo,
    VideoAudienceWebrtc,
    VideoConfirmation,
    AspectRatio,
  },
  setup() {
    return { log: console.log };
  },
  template: `
  <div class="layout-videotest">
    <div><spec-video id="test" /><p><br/> Original  WebRTC + server video stitching (huge initial lag, medium update lag, very big number of participants. No audio support)</p></div>
    <div><video-audience-webrtc id="test" /><p><br/> WebRTC based on OpenVidu (minimum initial lag, minimum update lag, limited number of participants. Has audio support)</p></div>
    <div><video-audience-images /><p><br/>Sending video still frames via websocket (small initial lag, 1sec update lag, medium number of participants). No audio support</p></div>
  </div>
  `,
};
