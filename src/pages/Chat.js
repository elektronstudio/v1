import { ref, onMounted } from "../deps/vue.js";

export default {
  setup() {
    const messagesEl = ref(null);
    onMounted(() => {
      const observer = new MutationObserver(
        () => (messagesEl.value.scrollTop = messagesEl.value.scrollHeight)
      );
      observer.observe(messagesEl.value, { childList: true });
    });

    const messages = ref([]);

    setInterval(() => messages.value.push({ value: Math.random() }), 1000);

    return { messages, messagesEl };
  },
  template: `
  <div class="layout-index">
    <div style="grid-area: events">
      <h1>Chat</h1>
      <div ref="messagesEl" style="border: 1px solid red; height: 50vh; overflow: scroll">
        <pre v-for="message in messages">{{ message }}</pre>
      </div>
    </div>
  </div>
  `,
};
