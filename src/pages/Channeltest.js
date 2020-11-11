// import { ref, onMounted } from "../deps/vue.js";

import { useChannels } from "../lib/index.js";

export default {
  setup() {
    const channels = useChannels("foyer2");
    return { channels };
  },
  template: `
  <div class="layout-videotest">
    <div>
      <pre>{{ channels }}</pre>
    </div>
  </div>
  `,
};
