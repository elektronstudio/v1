import VideoAudienceImages from "../components/VideoAudienceImages.js";
import SpecVideo from "../components/SpecVideo.js";
import ExperimentalSpecVideo from "../components/ExperimentalSpecVideo.js";
import VideoGrid from "../components/VideoGrid.js";

export default {
  components: {
    VideoGrid,
    VideoAudienceImages,
    SpecVideo,
    ExperimentalSpecVideo,
  },
  template: `
  <div class="layout-live">
    <!-- <video-audience-images style="grid-area: spec" /> -->
    <!-- <spec-video id="test" style="grid-area: spec" /> -->
    <experimental-spec-video id="test" style="grid-area: spec" />
  </div>
  `,
};
