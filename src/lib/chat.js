import { ref } from "../deps/vue.js";
import {
  useLocalstorage,
  safeJsonParse,
  socket,
  uniqueCollection,
  events,
  useTextarea,
  useScrollToBottom,
  createMessage,
} from "./index.js";

export const useChat = (channel) => {
  const messages = useLocalstorage("elektron_messages", []);
  const newMessage = ref("");

  socket.addEventListener("message", ({ data }) => {
    const m = safeJsonParse(data);

    // if (
    //   incomingMessage &&
    //   incomingMessage.type === "USERS_UPDATE" &&
    //   incomingMessage.value
    // ) {
    //   messages.value = messages.value.map((m) => {
    //     const updatedUser = incomingMessage.value.find(
    //       ({ userId }) => userId === m.userId
    //     );
    //     if (m.userId === updatedUser.userId) {
    //       m.userName = updatedUser.userName;
    //     }
    //     return m;
    //   });
    // }

    if (m && m.channel === channel) {
      if (m.type === "CHAT") {
        messages.value = [...messages.value, m];
      }
      if (m.type === "HEART") {
        messages.value = [...messages.value, { ...m, value: "❤️" }];
      }

      // Sync the archive

      if (m.type === "CHAT_SYNCED") {
        const syncedMessages = uniqueCollection(
          [...messages.value, ...m.value],
          "id"
        );
        messages.value = syncedMessages;
      }
    }
  });

  const onNewMessage = () => {
    const outgoingMessage = createMessage({
      type: "CHAT",
      channel: channel,
      value: newMessage.value,
    });
    socket.send(outgoingMessage);
    newMessage.value = "";
  };

  events.on("heart", () => {
    const outgoingMessage = {
      type: "HEART",
      channel: props.channel,
    };
    socket.send(outgoingMessage);
  });

  const textareaEl = useTextarea(onNewMessage);
  const scrollEl = useScrollToBottom();

  return {
    messages,
    newMessage,
    onNewMessage,
    scrollEl,
    textareaEl,
  };
};
