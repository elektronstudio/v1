import ExperimentalSpecVideo from "../components/ExperimentalSpecVideo.js";

export default {
  components: { ExperimentalSpecVideo },
  template: `
  <div class="layout-live">
  <div
      style="
        grid-area: spec;
        height: 0;
        max-width: 100%;
        padding-bottom: calc(1 / 1 * 100%);
        position: relative;
      "
    >
    <experimental-spec-video 
      style="
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
      "
      id="lores"
    />
  </div>
  </div>
  `,
};
