import {
  ref,
  onMounted,
  computed,
} from "https://unpkg.com/vue@3.0.0/dist/vue.esm-browser.prod.js";
import TurndownService from "https://cdn.skypack.dev/pin/turndown@v6.0.0-qC3MfTphTfj9zgLFS0WD/min/turndown.js";
import marked from "https://cdn.skypack.dev/pin/marked@v1.1.1-iZqTGJZXK3XAWXf76Ped/min/marked.js";
import {
  compareAsc,
  compareDesc,
  differenceInHours,
  formatDistanceToNowStrict,
} from "https://cdn.skypack.dev/pin/date-fns@v2.16.1-bghq1qKsQxU85Me2Z8iI/min/date-fns.js";
import {
  zonedTimeToUtc,
  utcToZonedTime,
  format,
} from "https://cdn.skypack.dev/date-fns-tz";

// Date utils

const isDatetime = (str) => String(str).match(/:/g);

const createDate = (str) => utcToZonedTime(str, "Europe/Tallinn");

const getDifference = (start, end) => {
  const diffStart = differenceInHours(
    createDate(start),
    createDate(new Date())
  );
  const diffEnd = differenceInHours(createDate(end), createDate(new Date()));
  //return `${diffStart} ${diffEnd}`;
  if (isDatetime(diffEnd) && diffEnd <= 12) {
    return { diff: "past", diffStart, diffEnd };
  } else if (!isDatetime(diffEnd) && diffEnd <= 0) {
    return { diff: "past", diffStart, diffEnd };
  } else if (isDatetime(diffEnd) && diffStart <= 0 && diffEnd > 0) {
    return { diff: "now", diffStart, diffEnd };
  } else if (diffStart <= 12) {
    return { diff: "soon", diffStart, diffEnd };
  } else {
    return { diff: "future", diffStart, diffEnd };
  }
};

const formatDate = (str) => {
  if (isDatetime(str)) {
    return format(createDate(str), "d. MMM y HH:mm") + " EET";
  } else {
    return format(createDate(str), "d. MMM y") + " EET";
  }
};

const formatAgo = (str) => {
  const diff = differenceInHours(createDate(str), new Date());
  return `${diff >= 0 ? "In " : ""} ${formatDistanceToNowStrict(
    new Date(str)
  )} ${diff < 0 ? "ago" : ""}`;
};

// Content utils

const turndown = new TurndownService();

const parseEvent = (event) => {
  const summary = event.summary ? event.summary.trim() : "";
  const start = event.start.date
    ? event.start.date
    : event.start.dateTime
    ? event.start.dateTime
    : "";
  const end = event.end.date
    ? event.end.date
    : event.end.dateTime
    ? event.end.dateTime
    : "";

  const markdown = turndown.turndown(event.description || "");
  const description = event.description ? marked(markdown) : "";

  const teaser = event.description ? marked(markdown.split("\n\n")[0]) : "";

  const ids = markdown.match(/(\n\r?id:\s?)(.*)/);
  const id = ids && ids[2] ? ids[2] : "";
  const youtubes = markdown.match(/(\n\r?youtube:\s?)(.*)/);
  const youtube = youtubes && youtubes[2] ? youtubes[2] : "";

  const diff = getDifference(start, end);
  return { summary, description, teaser, id, start, end, youtube, ...diff };
};

const fetchEvents = () => {
  const url =
    "https://www.googleapis.com/calendar/v3/calendars/mkr5k66b069hve1f7aa77m4bsc@group.calendar.google.com/events?key=AIzaSyAkeDHwQgc22TWxi4-2r9_5yMWVnLQNMXc";

  return fetch(url)
    .then((res) => res.json())
    .then(({ items }) =>
      items
        .map(parseEvent)
        .sort((a, b) => compareDesc(createDate(a.start), createDate(b.start)))
    );
};

// Components

const Youtube = {
  props: ["src"],
  setup(props) {
    const currentSrc = computed(() => {
      const { search } = new URL(props.src || "");
      const params = new URLSearchParams(search);
      const id = params.get("v");
      const start = params.get("start");
      return start
        ? `//youtube.com/embed/${id}?start=${start}`
        : `//youtube.com/embed/${id}`;
    });
    return { currentSrc };
  },
  template: `
    <p style="
      height: 0;
      max-width: 100%;
      overflow: hidden;
      padding-bottom: calc(9 / 16 * 100%);
      position: relative;
    ">
    <iframe
        style="
          height: 100%;
          left: 0;
          position: absolute;
          top: 0;
          width: 100%;
        "
        :src="currentSrc"
        frameborder="0"
        allowfullscreen
    />
  </p>
  `,
};

const Datetime = {
  props: ["event"],
  setup() {
    const color = computed(() =>
      event && (event.diff == "soon" || event.diff == "now") ? "red" : "inherit"
    );
    return { color, formatAgo, formatDate };
  },
  template: `
   <h4 style="font-weight: normal">
    ⏰
    <b :style="{ color }">
      {{ formatAgo(event.start) }}
    </b>
    &ensp;
    <span style="opacity:0.7">
      {{ formatDate(event.start) }} → {{ formatDate(event.end) }}
    </span>
  </h4>
  `,
};

const EventRow = {
  components: { Youtube, Datetime },
  props: ["event"],
  setup(props) {
    const isOpen = ref(false);
    const style = computed(() => {
      return {
        borderLeft: `3px solid ${
          props.event.diff == "soon" || props.event.diff == "now"
            ? "red"
            : "none"
        }`,
        opacity: props.event.diff == "past" ? 0.5 : 1,
      };
    });

    const pillClass = computed(() => {
      const isSoon = props.event.diff == "soon" || props.event.diff == "now";
      return {
        "pill-red": isSoon,
        "pill-gray": !isSoon,
      };
    });

    return { isOpen, style, pillClass };
  },
  template: `
  <article :style="style" style="display: grid; gap: 12px; paddingLeft: 24px">
      <h3
        style="cursor: pointer; margin: 0"
        @click="isOpen = !isOpen"
        
      >
        {{ event ? event.summary : '' }}
      </h3>  
      
      <datetime :event="event" />
      <p style="line-height: 0.5em" />
      <router-link v-if="event.id" style="display: block" :to="'/' + event.id">
        <div :class="pillClass">
          See the live at <b>{{ event.id }}.elektron.live</b> →
        </div>
      </router-link>
    <div v-if="isOpen" v-html="event ? event.description : ''" />
    <br v-if="event && event.youtube" />
    <youtube v-if="event && event.youtube" :src="event.youtube" />
  </article>
  `,
};

export default {
  components: {
    EventRow,
  },
  setup() {
    const currentEvents = ref([]);
    const pastEvents = ref([]);
    onMounted(() =>
      fetchEvents().then((events) => {
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
    <div style="grid-area: header">
      <img src="index.svg" style="width: 300px" />
      <br />
      <br />
    </div>
    <div style="grid-area: events; display: grid; gap: 48px">
      <h2>Upcoming events</h2>
      <event-row v-for="event in currentEvents" :event="event"></event-row>
      <h2>Past events</h2>
      <event-row v-for="event in pastEvents" :event="event"></event-row>
    </div>
    <div style="grid-area: about; opacity: 0.7">
      <h2>About</h2>
      <br />
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
    </div>
  </div>
  `,
};
