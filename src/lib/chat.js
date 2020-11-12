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

    if (m && m.type === "RESET" && m.value) {
      messages.value = [];
    }

    if (m && m.type === "CHANNELS_UPDATED" && m.value) {
      // Find all the unique userIds with their usernames from the channel update

      const updatedUsers = Object.fromEntries(
        Object.values(m.value || {})
          .map(({ users }) =>
            Object.entries(users).map(([userId, { userName }]) => [
              userId,
              userName,
            ])
          )
          .flat()
      );

      // Update messages history with new usernames

      messages.value = messages.value.map((message) => {
        if (updatedUsers[message.userId]) {
          message.userName = updatedUsers[message.userId];
        }
        return message;
      });
    }

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
      type: newMessage.value === "/reset" ? "RESET" : "CHAT",
      channel: channel,
      value: newMessage.value,
    });
    socket.send(outgoingMessage);
    newMessage.value = "";
  };

  events.on("heart", () => {
    const outgoingMessage = {
      type: "HEART",
      channel: channel,
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
