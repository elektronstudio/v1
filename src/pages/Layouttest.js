import { ref, computed } from "../deps/vue.js";

import AspectRatio from "../components/AspectRatio.js";
import VideoPerformer from "../components/VideoPerformer.js";
import ChatAudienceMessages from "../components/ChatAudienceMessages.js";
import VideoAudienceImages from "../components/VideoAudienceImages.js";
import IconToLeft from "../components/IconToLeft.js";
import IconToRight from "../components/IconToRight.js";

export default {
  components: {
    VideoPerformer,
    IconToLeft,
    IconToRight,
    ChatAudienceMessages,
    VideoAudienceImages,
  },
  setup() {
    const chatOpen = ref(true);
    const style = computed(() => {
      return {
        gridTemplateColumns: chatOpen.value
          ? "3fr minmax(400px, auto) 300px"
          : "3fr minmax(400px, auto) 40px",
      };
    });
    const onClick = () => (chatOpen.value = !chatOpen.value);
    return { onClick, style, chatOpen };
  },
  template: `
  <div class="layout-test" :style="style">
    <div style="grid-area: performer">
      <video-performer></video-performer>
    </div>
    <div
      style="
        grid-area: audience;
        position: sticky;
        top: 0;
        display: grid;
        grid-template-rows: auto 1fr;
        height: 100vh;
        background: rgba(30,30,30,0.5);
        padding: 24px;
      "
    >
      <div style="margin-bottom: 16px; height: 32px;"><h4>Live audience</h4></div>
      <video-audience-images style="border: 2px solid blue" :ratio="1 / 2" />
    </div>
    <div
      style="
        grid-area: chat;
        position: sticky;
        top: 0;
        display: grid;
        grid-template-rows: auto 1fr;
        height: 100vh;
        background: rgba(30,30,30,0.75);
        padding: 24px;
      "
      :style="{padding: chatOpen ? '24px' : '24px 10px'}"
    >
      <div @click="onClick"
        style="
          margin-bottom: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          height: 32px;
        ">
        <h4 v-if="chatOpen">Chat</h4>
        <icon-to-left v-if="!chatOpen" />
        <icon-to-right v-if="chatOpen" />
      </div>
      <chat-audience-messages v-if="chatOpen" />
    </div>
    <div style="padding: 32px; grid-area: about">
      <p />
      <h1>Eesti kooliteatrite festival</h1>
      <p />
      <p>Kooliteater 2020" põhikoolide kooliteatrite riigifestival toimub reedel, 23. oktoobril.</p>
<p>Festivali korraldab Eesti Harrastusteatrite Liit koostöös kunstirühmitusega eˉlektron. 
Elektron.live kahesuunaline veebistriimimisplatvorm on loodud kunstirühmituse eˉlektron poolt.  
Festivali etendustele annavad tagasisidet Lennart Peep (TÜVKA lavastajaõppe õppejõud, vabakutseline lavastaja) ja Maret Oomer (õpetaja, kooliteatrite juhendaja ja harrastusteatri lavastaja).</p>
    </div>

  </div>
  `,
};
