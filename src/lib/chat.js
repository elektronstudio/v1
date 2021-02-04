import { ref, computed } from "../deps/vue.js";
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
  const allMessages = useLocalstorage("elektron_messages", []);
  const likes = useLocalstorage("elektron_likes", []);
  const messages = computed(() =>
    allMessages.value.filter((message) => message.channel === channel)
  );
  const newMessage = ref("");

  socket.addEventListener("message", ({ data }) => {
    const m = safeJsonParse(data);

    if (m && m.type === "RESET" && m.value) {
      allMessages.value = [];
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

      allMessages.value = allMessages.value.map((message) => {
        if (updatedUsers[message.userId]) {
          message.userName = updatedUsers[message.userId];
        }
        return message;
      });
    }

    if (m && m.channel === channel) {
      if (m.type === "CHAT") {
        allMessages.value = [...allMessages.value, m];
      }
      if (m.type === "LIKE") {
        likes.value = [...likes.value, m];
        console.log(m);
      }
      if (m.type === "HEART") {
        allMessages.value = [...allMessages.value, { ...m, value: "❤️" }];
      }

      // Sync the archive

      if (m.type === "CHAT_SYNCED") {
        const syncedMessages = uniqueCollection(
          [...allMessages.value, ...m.value],
          "id"
        );
        allMessages.value = syncedMessages;
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

  const onLike = (id) => {
    const outgoingMessage = createMessage({
      type: "LIKE",
      channel: channel,
      value: id,
    });
    socket.send(outgoingMessage);
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
    likes,
    allMessages,
    messages,
    newMessage,
    onNewMessage,
    onLike,
    scrollEl,
    textareaEl,
  };
};
