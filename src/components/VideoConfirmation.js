import { ref } from "../deps/vue.js";

export default {
  props: { started: { default: false } },
  setup(props, { emit }) {
    const hasStarted = ref(props.started);
    const onStart = () => {
      hasStarted.value = true;
      emit("start");
    };
    const onStop = () => {
      hasStarted.value = false;
      emit("stop");
    };
    return { hasStarted, onStart, onStop };
  },
  template: `
  <slot />
  <div
    v-if="!hasStarted"
    style="
      position: absolute;
      top: 0;
      right: 0;
      left: 0;
      bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 0 32px;
      background: rgba(0, 0, 0, 0.5);
    "
  >
    <div>
      <p>
        Please allow access to your camera to be a
        public audience member in our venue.
      </p>
      <button @click="onStart">Start camera</button>
    </div>
  </div>
  <div
    v-if="hasStarted"
    style="
      position: absolute;
      right: 0;
      left: 0;
      bottom: 16px;
      text-align: center;
    "
  >
    <button @click="onStop">Stop my camera</button>
  </div>
  `,
};
