import VideoAudienceImages from "../components/VideoAudienceImages.js";
import SpecVideo from "../components/SpecVideo.js";
import ExperimentalSpecVideo from "../components/ExperimentalSpecVideo.js";
import VideoGrid from "../components/VideoGrid.js";
import VideoConfirmation from "../components/VideoConfirmation.js";
import AspectRatio from "../components/AspectRatio.js";

export default {
  components: {
    VideoGrid,
    VideoAudienceImages,
    SpecVideo,
    ExperimentalSpecVideo,
    VideoConfirmation,
    AspectRatio,
  },
  setup() {
    return { log: console.log };
  },
  template: `
  <div class="layout-live">
    <!-- <aspect-ratio style="border: 2px solid red">
      <video-confirmation @start="log('start')" @stop="log('stop')" style="border: 2px solid blue"></video-confirmation>
    </aspect-ratio> -->
    <video-audience-images style="grid-area: spec" />
    <!-- <spec-video id="test" style="grid-area: spec" /> -->
    <!-- <experimental-spec-video id="test" style="grid-area: spec" /> -->
  </div>
  `,
};
