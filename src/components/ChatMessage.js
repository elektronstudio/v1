import { computed } from "../deps/vue.js";
import { formatAgo, formatDate } from "../utils/index.js";

export default {
  props: ["message", "userId"],
  setup(props) {
    return { formatAgo };
  },
  template: `
  <div style="display: flex; font-size: 13px; margin-bottom: 8px;">
      <div style="opacity: 0.5">{{ message.from.name }}</div>&emsp;
      <!-- <div style="opacity: 0.25">{{formatAgo(message.datetime) }}</div> -->
    </div>
  <div
    style="
      display: inline-block;
      borderRadius: 8px;
      padding: 12px;
      gap: 7px;
      font-size: 15px;
    "
    :style="{
      background: message.from.id === userId ? '#222' : '#444'
    }"
  >
    <div v-html="message.value"></div>
  </div>
  `,
};
