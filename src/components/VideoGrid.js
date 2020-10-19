import { ref, computed } from "../deps/vue.js";

export default {
  props: ["length"],
  setup(props) {
    // https://stackoverflow.com/a/51956837
    const proportion = 4 / 3;
    const columns = computed(() =>
      Math.min(
        props.length + 1,
        Math.round(Math.sqrt(proportion * props.length + 1))
      )
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
