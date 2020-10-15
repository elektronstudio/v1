import { computed } from "../deps/vue.js";
import PublisherVideo from "./PublisherVideo.js";

export default {
  components: {
    PublisherVideo,
  },
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
	  <div style="border: 1px solid yellow; height: 100%;">
      <publisher-video v-if="publisher" :publisher="publisher"/>
    </div>
  <!-- <div>
	  <publisher-video v-if="publisher" :publisher="publisher"/>
	  <div>{{ clientData.userName }}</div>
  </div> -->
  `,
};
