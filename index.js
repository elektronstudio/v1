import {
  format,
  compareDesc,
  differenceInHours,
  formatDistanceToNowStrict,
} from "https://cdn.skypack.dev/pin/date-fns@v2.16.1-bghq1qKsQxU85Me2Z8iI/min/date-fns.js";

import TurndownService from "https://cdn.skypack.dev/pin/turndown@v6.0.0-qC3MfTphTfj9zgLFS0WD/min/turndown.js";

import marked from "https://cdn.skypack.dev/pin/marked@v1.1.1-iZqTGJZXK3XAWXf76Ped/min/marked.js";

const formatDate = (str) => {
  if (str.match(/:/g)) {
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

  const description = event.description
    ? marked(turndown.turndown(event.description))
    : "";

  const teaser = event.description
    ? marked(turndown.turndown(event.description).split("\n\n")[0])
    : "";

  const ids = description.match(/(id:\s?)(.*)/g);
  const id =
    ids && ids[0]
      ? ids[0]
          .replace(/(<([^>]+)>)/gi, "")
          .split(":")[1]
          .trim()
      : "";
  return { summary, description, teaser, id, start, end };
};

const Event = (event) => {
  const diff = differenceInHours(new Date(event.start), new Date());
  return `
  <div style="opacity: ${diff < 0 ? 0.3 : 1}">
  <div style="display: grid; grid-template-columns: 1fr auto; align-items: flex-start;">
    <h2>${event.summary}</h2>
    ${
      event.id && diff >= 0
        ? `<a target="_blank" href="http://${event.id}.elektron.live"><div class="pill">${event.id}.elektron.live</div></a>`
        : ""
    }
  </div>
  <br />
  <h4>⏰ ${formatAgo(event.start)} <span style="opacity:0.7">${formatDate(
    event.start
  )} → ${formatDate(event.end)} </span></h4>
  <br />
  <div style="opacity: 0.8">${event.teaser}</div>
</div>
`;
};

const render = (id, content) =>
  (document.getElementById(id).innerHTML = Array.isArray(content)
    ? content.join("")
    : content);

const url =
  "https://www.googleapis.com/calendar/v3/calendars/mkr5k66b069hve1f7aa77m4bsc@group.calendar.google.com/events?key=AIzaSyAkeDHwQgc22TWxi4-2r9_5yMWVnLQNMXc";

// fetch(url)
//   .then((res) => res.json())
//   .then(({ items }) =>
//     render(
//       "schedule",
//       items
//         .map(parseEvent)
//         .sort((a, b) => compareDesc(new Date(a.start), new Date(b.start)))
//         .map(Event)
//     )
//   );
