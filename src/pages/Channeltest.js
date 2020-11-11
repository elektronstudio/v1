// import { ref, onMounted } from "../deps/vue.js";

import { useChannel, useUser, useSettings } from "../lib/index.js";

export default {
  setup() {
    const { userName } = useUser();
    const settings = useSettings();
    const { channels, count } = useChannel("foyer2");
    return { userName, channels, count, settings };
  },
  template: `
  <div class="layout-videotest">
    <div>
      {{ userName  }}
      <div><input v-model="userName" /></div>
      <div>{{ settings.positionX }} <p /><input v-model="settings.positionX" type="range" /></div>
      <pre>{{ channels }}</pre>
    </div>
    <pre>{{ channel }}</pre>
    <pre>{{ count }}</pre>
  </div>
  `,
};
