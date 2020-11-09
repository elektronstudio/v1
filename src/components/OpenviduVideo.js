import { ref, onMounted, computed } from "../deps/vue.js";

import {} from "../deps/vue.js";

const OpenviduVideoElement = {
  props: ["publisher"],
  setup(props) {
    const video = ref(null);
    onMounted(() => props.publisher.addVideoElement(video.value));
    return { video };
  },
  template: `
    <video ref="video" muted autoplay />
  `,
};

export default {
  components: { OpenviduVideoElement },
  props: ["publisher"],
  setup(props) {
    const clientData = computed(() => {
      if (props.publisher) {
        const { connection } = props.publisher.stream;
        return JSON.parse(connection.data);
      }
      return { userName: null };
    });
    return { clientData };
  },
  template: `
	  <div>
      <openvidu-video-element v-if="publisher" :publisher="publisher" />
    </div>
    <!-- <div>{{ clientData.userName }}</div> -->
  `,
};
