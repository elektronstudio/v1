import ExperimentalChat from "../components/ExperimentalChat.js";

export default {
  components: { ExperimentalChat },
  setup() {
    const chatUrl = "wss://ws-fggq5.ondigitalocean.app";
    return { chatUrl };
  },
  template: `
  <div class="layout-live">
    <div style="grid-area: main; display: flex; align-items: center;">
      <h1>Chat demo</h1>&nbsp;&nbsp;&nbsp;
      <router-link to="/"><div class="pill-gray">← Back to schedule</div></router-link>
    </div>
    <experimental-chat style="grid-area: chat" />
  </div>
  `,
};
