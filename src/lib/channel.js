import {
  ref,
  reactive,
  onMounted,
  onUnmounted,
  watch,
  computed,
} from "../deps/vue.js";
import { socket, createMessage, safeJsonParse } from "./index.js";

export const useChannel = (channel) => {
  const channels = ref({});

  socket.addEventListener("message", ({ data }) => {
    const message = safeJsonParse(data);
    if (message && message.type === "CHANNELS_UPDATED" && message.value) {
      channels.value = message.value;
    }
    if (message && message.type === "RESET") {
      channels.value = {};
    }
  });

  const joinChannel = () => {
    const outgoingMessage = createMessage({
      type: "CHANNEL_JOIN",
      channel: channel,
    });
    socket.send(outgoingMessage);
  };

  const leaveChannel = () => {
    const outgoingMessage = createMessage({
      type: "CHANNEL_LEAVE",
      channel: channel,
    });
    socket.send(outgoingMessage);
  };

  onMounted(() => {
    joinChannel();
    window.addEventListener("beforeunload", leaveChannel);
  });

  onUnmounted(() => window.removeEventListener("beforeunload", leaveChannel));

  const count = computed(() =>
    Math.max(
      1,
      channels.value[channel] && channels.value[channel].users
        ? Object.entries(channels.value[channel].users).length
        : 1
    )
  );

  return { channels, count };
};
