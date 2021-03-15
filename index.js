import * as components from './src/components/index.js';
import {
  createRouter,
  createWebHistory,
} from './src/deps/router.js';
import { createApp } from './src/deps/vue.js';
import Channeltest from './src/pages/Channeltest.js';
import Live from './src/pages/Live.js';
//import Index from "./src/pages/Index.js";
import Redirect from './src/pages/Redirect.js';
import Videotest from './src/pages/Videotest.js';

const routes = [
  { path: "/channeltest", component: Channeltest },
  { path: "/videotest", component: Videotest },
  { path: "/:channel", component: Live },
  { path: "/", component: Redirect },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

const app = createApp({});
app.use(router);

Object.entries(components).forEach(([name, component]) =>
  app.component(name, component)
);

app.mount("#app");
