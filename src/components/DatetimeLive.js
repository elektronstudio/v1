import { computed } from "../deps/vue.js";

import { formatAgo, formatDate } from "../lib/index.js";

export default {
  props: ["event"],
  setup() {
    const color = computed(() =>
      event && (event.diff == "soon" || event.diff == "now") ? "red" : "inherit"
    );
    return { color, formatAgo, formatDate };
  },
  template: `
   <h4>
    <!--⏰
    <span :style="{ color }">
      {{ formatAgo(event) }}
    </span>
    <br />-->
    <span style="opacity:0.7">
      {{ formatDate(event.start) }} → {{ formatDate(event.end) }}
    </span>
  </h4>
  `,
};
