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

export const useChat = (channel, customOptions = {}) => {
  const options = { chattype: "CHAT", ...customOptions };
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
      likes.value = [];
    }

    if (m && m.type === "UPDATE" && m.value) {
      location.reload();
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
      if (m.type === options.chattype) {
        allMessages.value = [...allMessages.value, m];
      }
      if (m.type === "LIKE") {
        // TODO: Remove this duplicates control
        const existing = likes.value.map((l) => l.id);
        if (!existing.includes(m.id)) {
          likes.value = [...likes.value, m];
        }
      }
      if (m.type === "HEART") {
        allMessages.value = [...allMessages.value, { ...m, value: "❤️" }];
      }

      // Sync the archive

      if (m.type === "CHAT_SYNC") {
        const syncedMessages = uniqueCollection(
          [...allMessages.value, ...m.value],
          "id"
        );
        allMessages.value = syncedMessages;
      }

      if (m.type === "LIKE_SYNC") {
        const syncedLikes = uniqueCollection(
          [...likes.value, ...m.value],
          "id"
        );
        likes.value = syncedLikes;
      }
    }
  });

  const onNewMessage = () => {
    const outgoingMessage = createMessage({
      type:
        newMessage.value === "/update"
          ? "UPDATE"
          : newMessage.value === "/reset"
          ? "RESET"
          : "CHAT",
      channel: channel,
      value: newMessage.value,
    });
    socket.send(outgoingMessage);
    newMessage.value = "";
  };

  const onLike = (id, userId) => {
    const i = likes.value.findIndex((l) => {
      return l.value === id && l.userId === userId;
    });

    if (i === -1) {
      const outgoingMessage = createMessage({
        type: "LIKE",
        channel: channel,
        value: id,
      });
      socket.send(outgoingMessage);
    }
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
