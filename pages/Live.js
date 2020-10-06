import { useRoute } from "../router.js";

export default {
  setup() {
    const { params } = useRoute();
    return { id: params.id };
  },
  template: "<div>Live: {{ id }}</div>",
};
