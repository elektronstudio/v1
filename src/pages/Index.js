import { ref, onMounted } from "../deps/vue.js";

import { fetchEvents } from "../lib/index.js";

import { eventsUrl } from "../../config.js";

export default {
  setup() {
    const currentEvents = ref([]);
    const pastEvents = ref([]);
    onMounted(() =>
      fetchEvents(eventsUrl).then((events) => {
        currentEvents.value = events
          .filter(({ diff }) => {
            return diff !== "past";
          })
          .reverse();

        pastEvents.value = events.filter(({ diff }) => diff == "past");
      })
    );
    return { currentEvents, pastEvents };
  },
  template: `
    <div class="layout-index">
    <div style="grid-area: events; display: grid;">
      <div style="padding: 24px"><logo /></div>
      <event-row v-for="event in currentEvents" :event="event"></event-row>
      <br />
      <br />
      <h4 style="padding: 24px">Past events</h4>
      <event-row v-for="event in pastEvents" :event="event"></event-row>
    </div>
    <div style="grid-area: about; padding: 24px; background: rgba(255,255,255,0.075);">
      <h4>About</h4>
      <br />
      <p>
        elektron.live is a online stage, a virtual
        performative space where performers and audience can see and interact with each other. With the invention of a new virtual space we also have to invent a new kind of performing arts.
      </p>
      <p>
        Much like the first movies at the turn of 20'th century were just recordings of the theatre performances, so far the online shows of the  theatre are copies of the shows made in real life. It took Dziga Vertov and his "Man with the movie camera" to make movies look like movies. We are now creating a tool for artists to do the same for the online performances.
      </p>
      <p>
        All our code is freely available in <a href="https://github.com/elektronstudio">Github</a>
      </p>
      <p>See also our <a href="https://www.facebook.com/elektron.art">Facebook</a> and <a href="https://www.youtube.com/channel/UCgjelXmsVEYyQAivDXDQQFQ/videos">Youtube</a> page.</p>
    </div>
  </div>
  `,
};
