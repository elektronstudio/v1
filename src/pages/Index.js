import { ref, onMounted } from "../deps/vue.js";

import { fetchEvents } from "../utils/index.js";

import EventRow from "../components/EventRow.js";

export default {
  components: {
    EventRow,
  },
  setup() {
    const eventsUrl =
      "https://www.googleapis.com/calendar/v3/calendars/mkr5k66b069hve1f7aa77m4bsc@group.calendar.google.com/events?key=AIzaSyAkeDHwQgc22TWxi4-2r9_5yMWVnLQNMXc";

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
    document.body.style.setProperty("background", "black");
    return { currentEvents, pastEvents };
  },
  template: `
    <div class="layout-index">
    <div style="grid-area: header">
      <img src="index.svg" style="width: 250px;" />
      <br />
      <br />
    </div>
    <div style="grid-area: events; display: grid; gap: 32px">
      <h2 class="rotalic">Upcoming events</h2>
      <event-row v-for="event in currentEvents" :event="event"></event-row>
      <h2>Past events</h2>
      <event-row v-for="event in pastEvents" :event="event"></event-row>
    </div>
    <div style="grid-area: about; opacity: 0.7">
      <h2 class="rotalic">About</h2>
      <br />
      <p>
        elektron.live can be considered as an online stage or a virtual
        performative space. One of its main driving forces is to bring
        performers and audiences together (with the use of a two-way
        streaming) while minimizing the restrictions to access since any
        number of audience members is possible.
      </p>
      <p>
        When inventing and building elektron.live we realized that the
        platform could be something more than only a way of demonstrating
        performers and audience to each-other. We have never had a medium
        before where there is a live interaction on both sides of the screen
        simultaneously! We also learned that performing arts online could
        never be the same as we know it from real encounters. With the
        invention of a new virtual space we also have to invent a new kind of
        performing arts. And that is something that really boosts our
        curiosity in what to look for in the future. A whole new world in
        arts!
      </p>
      <p>
        Much like the first movies at the turn of 20'th century were just
        recordings of the theatre performances, until now the online shows on
        the internet are copies of the shows made in real life. Despite having
        the internet for many decades, we are still inventing this medium for
        performing arts. It took Dziga Vertov and his "Man with the movie
        camera" to make movies look like movies. We are now creating a tool
        for artists to do the same for the online performances.
      </p>
      <p>
        elektron.live is created by e⁻lektron team together with Stepan
        Bolotnikov and <a href="https://babahh.com">Babahh Media</a>.
      </p>
      <router-link to="/chattest"><div class="pill-gray">Chat test</div></router-link>

    </div>
  </div>
  `,
};
