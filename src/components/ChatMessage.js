import { computed } from "../deps/vue.js";
import { formatAgo, formatDate } from "../utils/index.js";

export default {
  props: ["message"],
  setup() {
    return { formatAgo };
  },
  template: `
  <div>
    <div>
      <div>{{ message.user.name }}</div>
      <!-- <div>{{formatAgo(message.datetime) }}</div> -->
    </div>
    <div v-html="message.value"></div>
  </div>
  `,
};
