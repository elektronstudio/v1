import { ref } from "../deps/vue.js";

import DatetimeLive from "./DatetimeLive.js";

export default {
  components: { DatetimeLive },
  props: ["event"],
  setup() {
    const isSummary = ref(false);
    return { isSummary };
  },
  template: `
  <datetime-live v-if="event" :event="event"></datetime-live>
  <p style="margin-bottom: 8px"></p>
  <h3>{{ event ? event.summary : '' }}</h3>
  <p style="margin-bottom: 8px"></p>
  <div
    v-if="!isSummary"
    @click="isSummary = !isSummary"
    style="cursor: pointer"
    class="pill-gray"
  >
    More info
  </div>
  <div
    v-if="isSummary"
    style="opacity: 0.7"
    v-html="event ? event.description : ''"
  ></div>
`,
};
