import { ref, onMounted, onUnmounted, computed } from "../deps/vue.js";
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

export const useLocalstorage = (key = null, initialValue = null) => {
  const value = ref(initialValue);
  if (window.localStorage !== undefined) {
    if (initialValue !== null && key && !window.localStorage.getItem(key)) {
      window.localStorage.setItem(key, JSON.stringify(initialValue));
    }
    const localValue = computed({
      get: () => {
        let storedValue = null;
        if (key && window.localStorage.getItem(key)) {
          storedValue = JSON.parse(window.localStorage.getItem(key));
          return storedValue !== value.value ? storedValue : value.value;
        }
        return value.value;
      },
      set: (val) => {
        value.value = val;
        if (key) {
          window.localStorage.setItem(key, JSON.stringify(val));
        }
      },
    });
    return localValue;
  }
  return value;
};

export const useTextarea = (callback) => {
  const el = ref(null);

  const onKeydown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      callback();
    }
  };

  const onInput = (e) => {
    el.value.style.height = "auto";
    el.value.style.height = el.value.scrollHeight + "px";
  };

  onMounted(() => {
    el.value.focus();
    el.value.addEventListener("keydown", onKeydown);
    onInput();
    el.value.addEventListener("input", onInput);
  });

  onUnmounted(() => {
    el.value.removeEventListener("keydown", onKeydown);
  });

  return el;
};
