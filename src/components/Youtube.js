import { computed } from "../deps/vue.js";

export default {
  props: ["src"],
  setup(props) {
    const currentSrc = computed(() => {
      const { search } = new URL(props.src || "");
      const params = new URLSearchParams(search);
      const id = params.get("v");
      const start = params.get("start");
      return start
        ? `//youtube.com/embed/${id}?start=${start}`
        : `//youtube.com/embed/${id}`;
    });
    return { currentSrc };
  },
  template: `
    <p style="
      height: 0;
      max-width: 100%;
      overflow: hidden;
      padding-bottom: calc(9 / 16 * 100%);
      position: relative;
    ">
    <iframe
        style="
          height: 100%;
          left: 0;
          position: absolute;
          top: 0;
          width: 100%;
        "
        :src="currentSrc"
        frameborder="0"
        allowfullscreen
    />
  </p>
  `,
};
