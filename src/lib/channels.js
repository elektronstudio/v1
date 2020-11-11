import { ref, onMounted, onUnmounted } from "../deps/vue.js";
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
  });

  const joinChannel = () => {
    console.log(userId.value, userName.value);
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
    });
    socket.send(outgoingMessage);
  };

  onMounted(() => {
    joinChannel();
    window.addEventListener("beforeunload", leaveChannel);
  });

  onUnmounted(() => window.removeEventListener("beforeunload", leaveChannel));

  return channels;
};
