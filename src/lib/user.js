import { watch } from "../deps/vue.js";

import {
  socket,
  randomId,
  any,
  adjectives,
  animals,
  useLocalstorage,
  createMessage,
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
