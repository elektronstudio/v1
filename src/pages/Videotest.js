import VideoAudienceMosaic from "../components/VideoAudienceMosaic.js";
import VideoAudienceImages from "../components/VideoAudienceImages.js";
import VideoAudienceOpenvidu from "../components/VideoAudienceOpenvidu.js";

export default {
  components: {
    VideoAudienceMosaic,
    VideoAudienceImages,
    VideoAudienceOpenvidu,
  },
  template: `
  <div class="layout-videotest">
    <div><video-audience-mosaic id="test" /><p><br/>Original WebRTC implementation with server video stitching. Huge initial lag, medium update lag, very big number of participants. No audio support.</p></div>
    <div><video-audience-images /><p><br/>Sending still video frames via Websocket and broadcasting it to other clients. Small initial lag, 2fps updates, medium number of participants. No audio support.</p></div>
    <div><video-audience-openvidu id="test" /><p><br/>WebRTC based solution on OpenVidu server. Minimal initial lag, 12fps updates, limited number of participants. Has audio support.</p></div>
  </div>
  `,
};
