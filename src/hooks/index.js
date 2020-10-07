import { ref, onMounted } from "../deps/vue.js";
import { Hls } from "../deps/hls.js";

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
