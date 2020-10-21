import AspectRatio from "../components/AspectRatio.js";

export default {
  components: { AspectRatio },
  template: `
  <div class="layout-test">
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
      <div style="border: 2px solid orange; position: sticky; top: 32px; padding: 15px; height: calc(100vh - 32px - 32px);">
        Chat
      </div>
    </div>
    <div style="border: 2px solid red; padding: 15px; grid-area: about">
      {{ Array.from({ length: 300}).map(_ => 'absaa').join(' ') }}
    </div>

  </div>
  `,
};
