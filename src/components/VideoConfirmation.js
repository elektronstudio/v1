export default {
  props: ["started"],
  template: `
  <slot />
  <div
    v-if="!started"
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
      background: rgba(20, 20, 20, 0.2);
    "
  >
    <div>
      <p>
        Please allow access to your camera to be a
        public audience member in our venue. 
        Note that we do not use your microphone.
      </p>
      <button @click="$emit('start')">Start my camera</button>
    </div>
  </div>
  <div
    v-if="started"
    style="
      position: absolute;
      right: 0;
      left: 0;
      bottom: 16px;
      text-align: center;
    "
  >
    <button v-if="session" @click="$emit('stop')">Stop my camera</button>
  </div>
  `,
};
