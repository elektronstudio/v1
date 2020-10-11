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
      padding: 12px;
      gap: 7px;
      font-size: 15px;
      line-height: 1.5em;
    "
    :style="{
      background: isMyMessage ? 'rgba(50,50,50,0.5)' : 'rgba(50,50,50,0.25)'
    }"
  >
    <div v-html="message.value"></div>
  </div>
  `,
};
