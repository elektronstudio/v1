import { reactive, watch } from "../deps/vue.js";
import { createMessage, socket } from "./index.js";

export const useSettings = () => {
  const settings = reactive({ positionX: 0 });
  watch(
    () => settings.positionX,
    () => {
      const outgoingMessage = createMessage({
        type: "USER_UPDATE",
        value: { positionX: settings.positionX },
      });
      socket.send(outgoingMessage);
    }
  );
  return settings;
};
