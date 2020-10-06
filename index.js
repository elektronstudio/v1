import { createApp } from "https://unpkg.com/vue@3.0.0/dist/vue.esm-browser.prod.js";
import { createRouter, createWebHistory } from "./router.js";

import Live from "./src/pages/Live.js";
import Index from "./src/pages/Index.js";

const routes = [
  { path: "/:id", component: Live },
  { path: "/", component: Index },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

const app = createApp({});
app.use(router);

app.mount("#app");
