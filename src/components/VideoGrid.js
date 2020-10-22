import { ref, computed } from "../deps/vue.js";

export default {
  props: {
    ratio: {
      default: 1,
    },
  },
  setup(props, { slots }) {
    const count = slots.default ? slots.default().length : 1;
    // https://stackoverflow.com/a/51956837
    const columns = computed(() =>
      Math.min(count + 1, Math.round(Math.sqrt(props.ratio * count + 1)))
    );
    // const rows = computed(() =>
    //   Math.ceil((props.length + columns.value) / columns.value)
    // );
    return { columns };
  },
  template: `
  <div
    style="
      display: grid;
      align-items: flex-start;
      grid-auto-rows: max-content;
    "
    :style="{
      gridTemplateColumns: 'repeat(' + columns + ', 1fr)',
    }"
  >
    <slot />
  </div>
  `,
};
