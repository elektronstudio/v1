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
          .filter((event) => {
            return event.diff !== "past" && event.hidden !== "true";
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
      <h3 style="opacity: 0.7">News</h3>
      <br />
      <img src="https://scontent-ber1-1.xx.fbcdn.net/v/t1.0-9/129761329_10157240772812142_1694358546196493422_o.jpg?_nc_cat=104&ccb=2&_nc_sid=0debeb&_nc_ohc=IIPCQkBOQ5QAX8A9m6o&_nc_ht=scontent-ber1-1.xx&oh=85a0f13de75e6bf477478042655d20b1&oe=5FF2F78C" />
      <p />
      <p class="about">elektron.live just got into the finals of <a href="https://garage48.org/events/48forthefuture">48 for the Future</a> hackaton by Garage48 and will be incubated in Wiseguys accelerator program. We built a prototype for the new homepage that <a href="https://elektron-hackaton.netlify.app">you can check out here</a>.</p>
      <h3 style="opacity: 0.7">About</h3>
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
