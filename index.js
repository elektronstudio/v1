import { createApp } from "./src/deps/vue.js";
import { createRouter, createWebHistory } from "./src/deps/router.js";

import Live from "./src/pages/Live.js";
import Index from "./src/pages/Index.js";
import Chat from "./src/pages/Chat.js";

const routes = [
  { path: "/chat", component: Chat },
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
