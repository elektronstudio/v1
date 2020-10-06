import {
  ref,
  onMounted,
  computed,
} from "https://unpkg.com/vue@3.0.0/dist/vue.esm-browser.prod.js";
import postscribe from "https://cdn.skypack.dev/postscribe";
import Hls from "https://cdn.skypack.dev/hls.js";

export const useHls = (url) => {
  const el = ref(null);
  onMounted(() => {
    if (el.value.canPlayType("application/vnd.apple.mpegurl")) {
      el.value.src = url;
      el.value.onerror = (e) => {
        el.value.src = url;
      };
    } else if (Hls.isSupported()) {
      const hls = new Hls({
        manifestLoadingRetryDelay: 5000,
        manifestLoadingMaxRetry: Infinity,
      });
      hls.attachMedia(el.value);
      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        hls.loadSource(url);
      });
    }
  });
  return el;
};
