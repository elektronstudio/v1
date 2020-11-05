import { ref, computed, watch } from "../deps/vue.js";

export default {
  props: {
    ratio: {
      default: 1,
    },
  },
  setup(props, { slots }) {
    const count = ref(1);
    watch(
      () => slots.default(),
      (slots) => (count.value = slots[0].children.length)
    );
    // https://stackoverflow.com/a/51956837
    const columns = computed(() => {
      const a = Math.min(
        count.value + 1,
        Math.round(Math.sqrt(props.ratio * count.value + 1))
      );
      return Math.max(2, a);
    });
    return { columns };
  },
  template: `
  <div
    class="grid"
    style="
      display: grid;
      grid-template-columns: 1fr 1fr;
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
