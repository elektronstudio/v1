import {
  createApp,
  ref,
  onMounted,
  computed,
} from "https://unpkg.com/vue@3.0.0/dist/vue.esm-browser.prod.js";
import TurndownService from "https://cdn.skypack.dev/pin/turndown@v6.0.0-qC3MfTphTfj9zgLFS0WD/min/turndown.js";
import marked from "https://cdn.skypack.dev/pin/marked@v1.1.1-iZqTGJZXK3XAWXf76Ped/min/marked.js";
import {
  format,
  compareAsc,
  differenceInHours,
  formatDistanceToNowStrict,
} from "https://cdn.skypack.dev/pin/date-fns@v2.16.1-bghq1qKsQxU85Me2Z8iI/min/date-fns.js";

// Date utils

const isDatetime = (str) => String(str).match(/:/g);

const getDifference = (start, end) => {
  const diffStart = differenceInHours(new Date(start), new Date());
  const diffEnd = differenceInHours(new Date(end), new Date());
  //return `${diffStart} ${diffEnd}`;
  if (isDatetime(diffEnd) && diffEnd <= 0) {
    return "past";
  } else if (!isDatetime(diffEnd) && diffStart <= 0) {
    return "past";
  } else if (isDatetime(diffEnd) && diffStart <= 0 && diffEnd > 0) {
    return "now";
  } else if (diffStart <= 12) {
    return "soon";
  } else {
    return "future";
  }
};

const formatDate = (str) => {
  if (isDatetime(str)) {
    return format(new Date(str), "d. MMM y HH:mm");
  } else {
    return format(new Date(str), "d. MMM y");
  }
};

const formatAgo = (str) => {
  const diff = differenceInHours(new Date(str), new Date());
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
  return { summary, description, teaser, id, start, end, diff, youtube };
};

const fetchEvents = () => {
  const url =
    "https://www.googleapis.com/calendar/v3/calendars/mkr5k66b069hve1f7aa77m4bsc@group.calendar.google.com/events?key=AIzaSyAkeDHwQgc22TWxi4-2r9_5yMWVnLQNMXc";

  return fetch(url)
    .then((res) => res.json())
    .then(({ items }) =>
      items
        .map(parseEvent)
        .sort((a, b) => compareAsc(new Date(a.start), new Date(b.start)))
    );
};

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
      <a v-if="event.id" target="_blank" style="display: block" :href="'./' + event.id">
        <div :class="pillClass">
          See the live at <b>{{ event.id }}.elektron.live</b> →
        </div>
      </a>
    <div v-if="isOpen" v-html="event ? event.description : ''" />
    <br v-if="event && event.youtube" />
    <youtube v-if="event && event.youtube" :src="event.youtube" />
  </article>
  `,
};

const App = {
  components: {
    EventRow,
  },
  setup() {
    const currentEvents = ref([]);
    const pastEvents = ref([]);
    onMounted(() =>
      fetchEvents().then((events) => {
        currentEvents.value = events.filter(({ diff }) => diff !== "past");
        pastEvents.value = events.filter(({ diff }) => diff === "past");
      })
    );
    return { currentEvents, pastEvents };
  },
};
const app = createApp(App);
app.mount("#app");

/*

import {
  format,
  compareAsc,
  compareDesc,
  differenceInHours,
  formatDistanceToNowStrict,
} from "https://cdn.skypack.dev/pin/date-fns@v2.16.1-bghq1qKsQxU85Me2Z8iI/min/date-fns.js";

import TurndownService from "https://cdn.skypack.dev/pin/turndown@v6.0.0-qC3MfTphTfj9zgLFS0WD/min/turndown.js";

import marked from "https://cdn.skypack.dev/pin/marked@v1.1.1-iZqTGJZXK3XAWXf76Ped/min/marked.js";

const isDatetime = (str) => String(str).match(/:/g);

const formatDate = (str) => {
  if (isDatetime(str)) {
    return format(new Date(str), "d. MMM y HH:mm");
  } else {
    return format(new Date(str), "d. MMM y");
  }
};

const formatAgo = (str) => {
  const diff = differenceInHours(new Date(str), new Date());
  return `${diff >= 0 ? "In " : ""} ${formatDistanceToNowStrict(
    new Date(str)
  )} ${diff < 0 ? "ago" : ""}`;
};

const getDifference = (start, end) => {
  const diffStart = differenceInHours(new Date(start), new Date());
  const diffEnd = differenceInHours(new Date(end), new Date());
  //return `${diffStart} ${diffEnd}`;
  if (isDatetime(diffEnd) && diffEnd <= 0) {
    return "past";
  } else if (!isDatetime(diffEnd) && diffStart <= 0) {
    return "past";
  } else if (isDatetime(diffEnd) && diffStart <= 0 && diffEnd > 0) {
    return "now";
  } else if (diffStart <= 12) {
    return "soon";
  } else {
    return "future";
  }
};

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

  const markdown = turndown.turndown(event.description);
  const description = event.description ? marked(markdown) : "";

  const teaser = event.description ? marked(markdown.split("\n\n")[0]) : "";

  const ids = markdown.match(/(\n\r?id:\s?)(.*)/);
  const id = ids && ids[2] ? ids[2] : "";
  const youtubes = markdown.match(/(\n\r?youtube:\s?)(.*)/);
  const youtube = youtubes && youtubes[2] ? youtubes[2] : "";

  const diff = getDifference(start, end);
  return { summary, description, teaser, id, start, end, diff, youtube };
};

const youtubeSrc = (src) => {
  const { search } = new URL(src || "");
  const params = new URLSearchParams(search);
  const id = params.get("v");
  const start = params.get("start");
  return start
    ? `//youtube.com/embed/${id}?start=${start}`
    : `//youtube.com/embed/${id}`;
};

// Components

const Youtube = (src) => `
  <div style="
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
      src="${youtubeSrc(src)}"
      frameborder="0"
      allowfullscreen
      ></iframe>
  </div>
`;

const Pill = (event) =>
  event.id
    ? `<a target="_blank" style="display: block" href="./${
        event.id
      }"><div class="${event.diff == "past" ? "pill-gray" : "pill-red"}">${
        event.id
      }.elektron.live</div></a>`
    : "";

const Datetime = (event) =>
  `<h4>⏰ <span style="color: ${
    event.diff == "soon" || event.diff == "now" ? "red" : "none"
  }">${formatAgo(
    event.start
  )}</span>&ensp;<span style="opacity:0.7">${formatDate(
    event.start
  )} → ${formatDate(event.end)} </span></h4>`;

const EventRow = (event) => `
  <article style="padding-left: ${
    event.diff == "soon" || event.diff == "now" ? "24px" : ""
  }; border-left: 3px solid ${
  event.diff == "soon" || event.diff == "now" ? "red" : "none"
}
  ; opacity: ${event.diff == "past" ? 0.5 : 1}">
    <header>
      <h3>${event.summary}</h3>
      ${Pill(event)}
    </header>
    <br />
    ${Datetime(event)}
    <br />
    ${event.youtube && `<br />${Youtube(event.youtube)}<br />`}
</article>
`;

const EventFull = (event) => `
  <article>
    <h3>${event.summary}</h3>
    <br />
    ${Datetime(event)}
    <br />
    <div>${event.description}</div>
</article>
`;

export const render = (id, content) =>
  (document.getElementById(id.replace("#", "")).innerHTML = Array.isArray(
    content
  )
    ? content.join("")
    : content);

const fetchEvents = () => {
  const url =
    "https://www.googleapis.com/calendar/v3/calendars/mkr5k66b069hve1f7aa77m4bsc@group.calendar.google.com/events?key=AIzaSyAkeDHwQgc22TWxi4-2r9_5yMWVnLQNMXc";

  return fetch(url)
    .then((res) => res.json())
    .then(({ items }) =>
      items
        .map(parseEvent)
        .sort((a, b) => compareAsc(new Date(a.start), new Date(b.start)))
    );
};

export const renderEvents = () => {
  const url =
    "https://www.googleapis.com/calendar/v3/calendars/mkr5k66b069hve1f7aa77m4bsc@group.calendar.google.com/events?key=AIzaSyAkeDHwQgc22TWxi4-2r9_5yMWVnLQNMXc";

  fetchEvents().then((events) => {
    render(
      "events-current",
      events.filter(({ diff }) => diff !== "past").map(EventRow)
    );
    render(
      "events-past",
      events
        .filter(({ diff }) => diff === "past")
        .sort((a, b) => compareDesc(new Date(a.start), new Date(b.start)))
        .map(EventRow)
    );
  });
};

export const renderEvent = (el, eventId) => {
  fetchEvents().then((events) =>
    render(
      el,
      events
        .filter(({ id }) => id === eventId)
        .slice(0, 1)
        .map(EventFull)
    )
  );
};
*/
