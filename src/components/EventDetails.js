import { ref } from "../deps/vue.js";

import DatetimeLive from "./DatetimeLive.js";

export default {
  components: { DatetimeLive },
  props: ["event"],
  setup() {
    const isSummary = ref(true);
    return { isSummary };
  },
  template: `
  <datetime-live v-if="event" :event="event"></datetime-live>
  <br />
  <h3>{{ event ? event.summary : '' }}</h3>
  <img v-if="event && event.image" style="width: 100%; margin: 16px 0;" :src="event.image" />
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
