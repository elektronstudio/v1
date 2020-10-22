import { createApp } from "./src/deps/vue.js";
import { createRouter, createWebHistory } from "./src/deps/router.js";

import Live from "./src/pages/Live.js";
import Index from "./src/pages/Index.js";
import Videotest from "./src/pages/Videotest.js";
import Layouttest from "./src/pages/Layouttest.js";

const routes = [
  { path: "/videotest", component: Videotest },
  { path: "/layouttest", component: Layouttest },
  { path: "/:channel", component: Layouttest },
  { path: "/", component: Index },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

const app = createApp({});
app.use(router);

app.mount("#app");
