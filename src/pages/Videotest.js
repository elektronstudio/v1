export default {
  template: `
  <div class="layout-videotest">
    <!-- <div><audience-websocket /><p><br/>Sending still video frames via Websocket and broadcasting it to other clients. Small initial lag, 1fps updates, untested number of. No audio support.</p></div>
    <div><audience-fetch /><p><br/>Sending still video frames using HTTPS POST request and returning image frames for all users. Small initial lag, 1fps updates, untested number of of participants. No audio support.</p></div> -->
    <div />
    <audience-openvidu id="test" />
    </div />
  </div>
  `,
};
