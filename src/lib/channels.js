import { ref, onMounted, onUnmounted, watch, computed } from "../deps/vue.js";
import {
  socket,
  randomId,
  any,
  adjectives,
  animals,
  useLocalstorage,
  createMessage,
  safeJsonParse,
} from "./index.js";

export const useUser = () => {
  const initialUserId = randomId();
  const initialUserName = `${any(adjectives)} ${any(animals)}`;

  const userId = useLocalstorage("elektron_user_id", initialUserId);
  const userName = useLocalstorage("elektron_user_name", initialUserName);

  watch(
    () => userName.value,
    () => {
      const outgoingMessage = createMessage({
        type: "USER_UPDATE",
        userId: userId.value,
        value: { userName: userName.value },
      });
      socket.send(outgoingMessage);
    }
  );
  return { userId, userName };
};

export const useChannels = (channel) => {
  const channels = ref({});
  const { userId, userName } = useUser();

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
      userId: userId.value,
      value: { userName: userName.value },
    });
    socket.send(outgoingMessage);
  };

  const leaveChannel = () => {
    const outgoingMessage = createMessage({
      type: "CHANNEL_LEAVE",
      channel: channel,
      userId: userId.value,
      userName: userName.value,
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
