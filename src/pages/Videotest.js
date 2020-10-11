import { ref, onMounted, watch, watchEffect } from "../deps/vue.js";
import ExperimentalSpecVideo from "../components/ExperimentalSpecVideo.js";

export default {
  components: { ExperimentalSpecVideo },
  template: `
  <div class="layout-live">
    <div style="grid-area: main; display: flex; align-items: center;">
      <h1>Video demo</h1>&nbsp;&nbsp;&nbsp;
      <router-link to="/"><div class="pill-gray">← Back to schedule</div></router-link>
    </div>
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
