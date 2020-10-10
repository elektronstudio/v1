import { ref, computed } from "../deps/vue.js";

import Youtube from "./Youtube.js";
import DatetimeIndex from "./DatetimeIndex.js";

export default {
  components: { Youtube, DatetimeIndex },
  props: ["event"],
  setup(props) {
    const isOpen = ref(false);
    const style = computed(() => {
      return {
        borderLeft: `3px solid ${
          props.event.diff == "soon" || props.event.diff == "now"
            ? "red"
            : "none"
        }`,
        paddingLeft:
          props.event.diff == "soon" || props.event.diff == "now" ? "24px" : 0,
        opacity: props.event.diff == "past" ? 0.5 : 1,
      };
    });

    const pillClass = computed(() => {
      const isSoon = props.event.diff == "now";
      return {
        "pill-red": isSoon,
        "pill-gray": !isSoon,
      };
    });

    return { isOpen, style, pillClass };
  },
  template: `
  <article :style="style" style="display: grid; gap: 12px">
      <router-link v-if="event.id" style="display: block" :to="'/' + event.id">
        <h3 style="cursor: pointer; margin: 0">{{  event.summary  }}</h3>
      </router-link>
      <h3 v-if="!event.id" style="cursor: pointer; margin: 0">{{ event.summary  }}</h3>
      <datetime-index :event="event" />
      <div class="flex">
        <div class="pill-gray" @click="isOpen = !isOpen">
          More info ↓
        </div>
        <router-link v-if="event.id" style="display: block" :to="'/' + event.id">
          <div :class="pillClass">
            See the live at <b>elektron.live/{{ event.id }}</b> →
          </div>
        </router-link>
      </div>
    <div v-if="isOpen" v-html="event ? event.description : ''" />
    <br v-if="event && event.youtube" />
    <youtube v-if="event && event.youtube" :src="event.youtube" />
  </article>
  `,
};
