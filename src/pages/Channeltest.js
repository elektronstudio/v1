// import { ref, onMounted } from "../deps/vue.js";

import { useChannels, useUser } from "../lib/index.js";

export default {
  setup() {
    const { userName } = useUser();
    const { channels, channel, count } = useChannels("foyer2");
    return { userName, channels, channel, count };
  },
  template: `
  <div class="layout-videotest">
    <div>
      {{ userName  }}
      <div><input v-model="userName" /></div>
      <pre>{{ channels }}</pre>
    </div>
    <pre>{{ channel }}</pre>
    <pre>{{ count }}</pre>
  </div>
  `,
};
