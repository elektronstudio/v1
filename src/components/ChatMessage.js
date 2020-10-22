import { computed } from "../deps/vue.js";
import { formatAgo } from "../utils/index.js";

export default {
  props: ["message", "userId"],
  setup(props) {
    const isMyMessage = computed(() => props.message.from.id === props.userId);
    return { formatAgo, isMyMessage };
  },
  template: `
  <div style="display: flex; font-size: 13px; margin-bottom: 8px;">
      <div :style="{opacity: isMyMessage ? 0.5 : 0.75}">{{ message.from.name }}</div>&emsp;
      <!-- <div style="opacity: 0.25">{{formatAgo(message.datetime) }}</div> -->
    </div>
  <div
    style="
      display: inline-block;
      borderRadius: 8px;
      padding: 8px 10px;
      gap: 7px;
      font-size: 15px;
      line-height: 1.5em;
      border: 2px solid rgba(255,255,255,0.2);
    "
    :style="{
      background: isMyMessage ? 'rgba(25,25,25,0.5)' : 'rgba(25,25,25,0.8)'
    }"
  >
    <div v-html="message.value"></div>
  </div>
  `,
};
