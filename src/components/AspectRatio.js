export default {
  props: {
    type: Number,
    ratio: {
      default: 16 / 9,
    },
  },
  template: `
  <div
    style="
      height: 0;
      width: 100%;
      position: relative;
      overflow: hidden;
    "
    :style="{
      paddingBottom: 'calc(' + 1 / ratio + ' * 100%)'
    }"
    class="aspect-ratio"
  >
    <slot />
  </div>
  `,
};
