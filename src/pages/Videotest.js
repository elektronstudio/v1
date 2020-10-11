import { ref, onMounted, watch, watchEffect } from "../deps/vue.js";
import ExperimentalSpecVideo from "../components/ExperimentalSpecVideo.js";

export default {
  components: { ExperimentalSpecVideo },
  template: `
  <div class="layout-live">
    <div style="
       grid-area: spec;
       display: flex;
       flex-wrap: wrap;
     ">
       <experimental-spec-video id="romeojulia" />
     </div>
  </div>
  `,
};
