import { ref, computed } from "../deps/vue.js";

import AspectRatio from "../components/AspectRatio.js";

export default {
  components: { AspectRatio },
  setup() {
    const chatOpen = ref(true);
    const style = computed(() => {
      return {
        gridTemplateColumns: chatOpen.value
          ? "3fr 1.5fr 1fr"
          : "3fr 1.5fr 0.1fr",
      };
    });
    const onClick = () => (chatOpen.value = !chatOpen.value);
    return { onClick, style, chatOpen };
  },
  template: `
  <div class="layout-test" :style="style">
    <div style="border: 2px solid red; grid-area: performer">
      <aspect-ratio>
        <div style="padding: 15px">
          <img src="../index.svg" style="width: 120px; display: block;" />
        </div>
      </aspect-ratio>
    </div>
    <div style="grid-area: audience">
      <div style="border: 2px solid yellow; position: sticky; top: 32px; padding: 15px; height: calc(100vh - 32px - 32px);">
        Audience
      </div>
    </div>
    <div style="grid-area: chat">
      <div @click="onClick" style="textAlign: right; cursor: pointer; border: 2px solid orange; position: sticky; top: 32px; padding: 15px; height: calc(100vh - 32px - 32px);">
        {{ chatOpen ? '→' : '←' }}
      </div>
    </div>
    <div style="border: 2px solid red; padding: 15px; grid-area: about">
      {{ Array.from({ length: 300}).map(_ => 'absaa').join(' ') }}
    </div>

  </div>
  `,
};
