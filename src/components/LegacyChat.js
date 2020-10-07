import { ref, onMounted } from "../deps/vue.js";
import { postscribe } from "../deps/postscribe.js";

export default {
  setup() {
    onMounted(() =>
      postscribe(
        "#legacy-chat",
        `<script
    id="cid0020000246593815710"
    data-cfasync="false"
    async
    src="//st.chatango.com/js/gz/emb.js"
    style="width: 100%; height: 280px"
  >
    {
      "handle":"elektronlivetest",
      "arch":"js",
      "styles":{
        "a":"000000",
        "b":100,
        "c":"FFFFFF",
        "d":"000000",
        "e":"000000",
        "g": "ffffff",
        "h":"999999",
        "k":"222222",
        "l":"000000",
        "m":"aaaaaa",
        "n":"aaaaaa",
        "p":"12",
        "q":"000000",
        "r":100,
        "t":40,
        "usricon":0,
        "allowpm":0,
        "cnrs":"0"
      }
    }
  </script>`
      )
    );
  },
  template: `<div id="legacy-chat"></div>`,
};
