import { ref, onMounted, onUnmounted, computed } from "../deps/vue.js";
import { Hls } from "../deps/hls.js";

import {
  safeJsonParse,
  randomId,
  any,
  adjectives,
  animals,
  socket,
  createMessage,
  debounce,
} from "./index.js";

import { chatUrl } from "../../config.js";

export const useHls = (url) => {
  const retryDelay = 4000;
  const el = ref(null);
  onMounted(() => {
    if (el.value.canPlayType("application/vnd.apple.mpegurl")) {
      el.value.src = url;
      el.value.onerror = debounce(() => (el.value.src = url), retryDelay);
    } else if (Hls.isSupported()) {
      const hls = new Hls({
        manifestLoadingRetryDelay: retryDelay,
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
    if (el.value) {
      //el.value.focus();
      el.value.addEventListener("keydown", onKeydown);
      onInput();
      el.value.addEventListener("input", onInput);
    }
  });

  onUnmounted(() => {
    if (el.value) {
      el.value.removeEventListener("keydown", onKeydown);
    }
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

/*
export const useClientsCount = (channel, userId, userName) => {
  const clientsCount = ref(0);

  socket.addEventListener("message", ({ data }) => {
    const message = safeJsonParse(data);
    if (message && message.type === "CHANNELS_UPDATE" && message.value) {
      const currentChannel = message.value.find((m) => m.channel === channel);
      if (currentChannel) {
        // The userIds type is object so we neet to cast it to array
        // TODO: fix the count 0 properly
        clientsCount.value = Math.max(1, [...currentChannel.userIds].length);
      }
    }
  });

  const onJoinChannel = () => {
    const outgoingMessage = createMessage({
      type: "CHANNEL_JOIN",
      channel: channel,
      userId: userId.value,
      userName: userName.value,
    });
    socket.send(outgoingMessage);
  };

  const onLeaveChannel = () => {
    const outgoingMessage = createMessage({
      type: "CHANNEL_LEAVE",
      channel: channel,
      userId: userId.value,
      userName: userName.value,
    });
    socket.send(outgoingMessage);
  };

  onMounted(() => {
    onJoinChannel();
    window.addEventListener("beforeunload", onLeaveChannel);
  });

  onUnmounted(() => window.removeEventListener("beforeunload", onStop));

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
*/
