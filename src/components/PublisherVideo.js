import { ref, onMounted } from "../deps/vue.js";

export default {
  props: ["publisher"],
  setup(props) {
    const video = ref(null);
    onMounted(() => props.publisher.addVideoElement(video.value));
    return { video };
  },
  template: `
    <video ref="video" muted autoplay style="border: 1px solid red; height: 100%;"/>
  `,
};
