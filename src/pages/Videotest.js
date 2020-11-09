export default {
  template: `
  <div class="layout-videotest">
    <div><video-audience-images /><p><br/>Sending still video frames via Websocket and broadcasting it to other clients. Small initial lag, 1fps updates, untested number of. No audio support.</p></div>
    <div><video-audience-post-images /><p><br/>Sending still video frames using HTTPS POST request and returning image frames for all users. Small initial lag, 1fps updates, untested number of of participants. No audio support.</p></div>
    <div><video-audience-openvidu id="test" /><p><br/>WebRTC based solution on OpenVidu server. Minimal initial lag, 12fps updates, limited number of participants. Has audio support.</p></div>
  </div>
  `,
};
