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
        opacity: props.event.diff == "past" ? 0.5 : 1,
      };
    });

    const pillClass = computed(() => {
      const isSoon = props.event.diff == "soon" || props.event.diff == "now";
      return {
        "pill-red": isSoon,
        "pill-gray": !isSoon,
      };
    });

    return { isOpen, style, pillClass };
  },
  template: `
  <article :style="style" style="display: grid; gap: 12px; paddingLeft: 24px">
      <h3
        style="cursor: pointer; margin: 0"
        @click="isOpen = !isOpen"
        
      >
        {{ event ? event.summary : '' }}
      </h3>  
      
      <datetime-index :event="event" />
      <p style="line-height: 0.5em" />
      <router-link v-if="event.id" style="display: block" :to="'/' + event.id">
        <div :class="pillClass">
          See the live at <b>{{ event.id }}.elektron.live</b> →
        </div>
      </router-link>
    <div v-if="isOpen" v-html="event ? event.description : ''" />
    <br v-if="event && event.youtube" />
    <youtube v-if="event && event.youtube" :src="event.youtube" />
  </article>
  `,
};
