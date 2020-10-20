import { ref, onMounted, onUnmounted, computed } from "../deps/vue.js";
import { Hls } from "../deps/hls.js";

import {
  safeJsonParse,
  randomId,
  any,
  adjectives,
  animals,
} from "../utils/index.js";

import { chatUrl } from "../config/index.js";

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
      el.value.style.height = "auto";
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

export const useScrollToBottom = () => {
  const el = ref(null);
  onMounted(() => {
    el.value.scrollTop = el.value.scrollHeight;
    const observer = new MutationObserver(
      () => (el.value.scrollTop = el.value.scrollHeight)
    );
    observer.observe(el.value, { childList: true });
  });
  return el;
};

export const useClientsCount = () => {
  const clientsCount = ref(false);

  const socket = new WebSocket(chatUrl);

  let interval = null;

  socket.onopen = () => {
    socket.send(JSON.stringify({ type: "statsRequest" }));
    interval = setInterval(
      () => socket.send(JSON.stringify({ type: "statsRequest" })),
      8000
    );
  };

  socket.onmessage = ({ data }) => {
    const message = safeJsonParse(data);
    if (message && message.type === "statsResponse") {
      clientsCount.value = message.clientsCount;
    }
  };

  socket.onclose = () => clearInterval(interval);

  return clientsCount;
};

export const useState = () => {
  const userId = useLocalstorage("elektron_user_id", randomId());
  const userName = useLocalstorage(
    "elektron_user_name",
    `${any(adjectives)} ${any(animals)}`
  );
  return { userId, userName };
};
