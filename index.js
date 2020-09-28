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

  const ids = markdown.match(/(id:\s?)(.*)/g);

  const id =
    ids && ids[0]
      ? ids[0]
          //.replace(/(<([^>]+)>)/gi, "")
          .split(":")[1]
          .trim()
      : "";
  const diff = getDifference(start, end);
  return { summary, description, teaser, id, start, end, diff };
};

const Pill = (event) =>
  event.id
    ? `<a target="_blank" style="display: block" href="http://${
        event.id
      }.elektron.live"><div class="${
        event.diff == "past" ? "pill-gray" : "pill-red"
      }">${event.id}.elektron.live</div></a>`
    : "";

const Datetime = (event) =>
  `<h4>⏰ <span style="color: ${
    event.diff == "soon" || event.diff == "now" ? "red" : "none"
  }">${formatAgo(
    event.start
  )}</span>&ensp;<span style="opacity:0.7">${formatDate(
    event.start
  )} → ${formatDate(event.end)} </span></h4>`;

const Event = (event) => `
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
    <div style="opacity: 0.8">${event.description}</div>
</article>
`;

const render = (id, content) =>
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
      events.filter(({ diff }) => diff !== "past").map(Event)
    );
    render(
      "events-past",
      events
        .filter(({ diff }) => diff === "past")
        .sort((a, b) => compareDesc(new Date(a.start), new Date(b.start)))
        .map(Event)
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
        .map(Event)
    )
  );
};
