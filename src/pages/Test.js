import Chat from "../components/Chat.js";

export default {
  components: { Chat },
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
    <chat :chatUrl="chatUrl" style="grid-area: chat"></chat>
  </div>
  `,
};
