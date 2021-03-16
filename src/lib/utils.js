import { ref, onMounted, onUnmounted, computed, isRef } from "../deps/vue.js";
import { postscribe } from "../deps/postscribe.js";
import { TurndownService } from "../deps/turndown.js";
import { marked } from "../deps/marked.js";

import {
  compareDesc,
  differenceInHours,
  formatDistanceToNowStrict,
} from "../deps/date-fns.js";
import { zonedTimeToUtc, utcToZonedTime, format } from "../deps/date-fns-tz.js";
import mitt from "https://cdn.skypack.dev/pin/mitt@v2.1.0-kXa6tLmCOzfamk79MfN2/min/mitt.js";

import {
  openviduUrl,
  openviduUsername,
  openviduPassword,
} from "../../config.js";

// Fit

// https://github.com/fregante/intrinsic-scale/blob/master/index.js
export const fit = (parentWidth, parentHeight, childWidth, childHeight) => {
  const doRatio = childWidth / childHeight;
  const cRatio = parentWidth / parentHeight;
  let width = parentWidth;
  let height = parentHeight;

  if (doRatio < cRatio) {
    height = width / doRatio;
  } else {
    width = height * doRatio;
  }

  return {
    x: (parentWidth - width) / 2,
    y: (parentHeight - height) / 2,
    width,
    height,
  };
};

// Debounce

export function debounce(fn, timeout) {
  let t;
  return function () {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, arguments), timeout);
  };
}

// ID

export const uuidv4 = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// Json utils

export const safeJsonParse = (str) => {
  try {
    return JSON.parse(str);
  } catch (err) {
    return null;
  }
};

export const safeStringify = (obj, indent = 2) => {
  let cache = [];
  const retVal = JSON.stringify(
    obj,
    (key, value) =>
      typeof value === "object" && value !== null
        ? cache.includes(value)
          ? undefined
          : cache.push(value) && value
        : value,
    indent
  );
  cache = null;
  return retVal;
};

// Date utils

const timezone = "Europe/Tallinn";

export const createDate = (str) => utcToZonedTime(str, timezone);

export const createNow = () =>
  format(utcToZonedTime(new Date(), timezone), "yyyy-MM-dd HH:mm:ss");

const isDatetime = (str) => String(str).match(/:/g);

const getDifference = (start, end) => {
  const diffStart = differenceInHours(
    createDate(start),
    createDate(new Date())
  );
  const diffEnd = differenceInHours(createDate(end), createDate(new Date()));
  if (isDatetime(start) && isDatetime(end)) {
    if (diffStart < 0 && diffEnd >= 0) {
      return { diff: "now", diffStart, diffEnd };
    } else if (diffStart >= 0 && diffStart <= 3) {
      return { diff: "soon", diffStart, diffEnd };
    } else if (diffStart >= 0 && diffStart > 3) {
      return { diff: "future", diffStart, diffEnd };
    } else {
      return { diff: "past", diffStart, diffEnd };
    }
  } else {
    // No time specified
    if (diffStart < 0) {
      return { diff: "past", diffStart, diffEnd };
    } else {
      return { diff: "future", diffStart, diffEnd };
    }
  }
};

export const formatDate = (str) => {
  if (isDatetime(str)) {
    return format(new Date(str), "d. MMM y HH:mm");
  } else {
    return format(new Date(str), "d. MMM y");
  }
};

export const formatAgo = (event) => {
  if (event.diff === "future" || event.diff === "soon") {
    return `Starts in ${formatDistanceToNowStrict(new Date(event.start))}`;
  }
  if (event.diff === "now") {
    return `Started ${formatDistanceToNowStrict(new Date(event.start))} ago`;
  }
  return `Ended ${formatDistanceToNowStrict(new Date(event.end))} ago`;
};

// Content utils

const hasTags = (str) => !!str.match(/(<([^>]+)>)/gi);

const stripTags = (str) => str.replace(/(<([^>]+)>)/gi, "");

const htmlDecode = (str) => {
  const doc = new DOMParser().parseFromString(str, "text/html");
  return doc.documentElement.textContent;
};

const findMetadata = (str, key) => {
  const pattern = `\n\r?(${key}:\s?)(.*)`;
  const matches = str.match(pattern);
  if (matches && matches[2]) {
    return htmlDecode(stripTags(marked(matches[2])).trim())
      .replace("/_", "_")
      .replace(/\\_/g, "_");
  }
  return "";
};

const turndown = new TurndownService();

export const parseEvent = (event) => {
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

  const rawDescription = event.description || "";

  let description = "";
  let metadataDescription = "";

  if (hasTags(rawDescription)) {
    const markdown = turndown.turndown(rawDescription);
    description = marked(markdown.split("---")[0], { breaks: true });
    metadataDescription = markdown;
  } else {
    description = marked(rawDescription.split("---")[0], { breaks: true });
    metadataDescription = rawDescription;
  }

  const id = findMetadata(metadataDescription, "id");
  const id2 = findMetadata(metadataDescription, "id2");
  const id3 = findMetadata(metadataDescription, "id3");
  const id4 = findMetadata(metadataDescription, "id4");
  const youtube = findMetadata(metadataDescription, "youtube");
  const image = findMetadata(metadataDescription, "image");
  const color = findMetadata(metadataDescription, "color");
  const hidden = findMetadata(metadataDescription, "hidden");
  const audience = findMetadata(metadataDescription, "audience");
  const chat = findMetadata(metadataDescription, "chat");
  const experimental = !!findMetadata(metadataDescription, "experimental");
  const sheetid = findMetadata(metadataDescription, "sheetid");
  const chattype = findMetadata(metadataDescription, "chattype");

  const diff = getDifference(start, end);

  return {
    id,
    id2,
    id3,
    id4,
    youtube,
    image,
    color,
    hidden,
    experimental,
    description,
    summary,
    description,
    start,
    end,
    audience,
    chat,
    sheetid,
    chattype,
    ...diff,
  };
};

export const fetchEvents = (url) => {
  return fetch(url)
    .then((res) => res.json())
    .then(({ items }) =>
      items
        .map(parseEvent)
        .sort((a, b) => compareDesc(createDate(a.start), createDate(b.start)))
    );
};

// Fetch

export const fetchAuth = ({
  url,
  payload = null,
  userName,
  password,
  method = "POST",
}) => {
  let headers = new Headers();
  headers.set("content-type", "application/json");
  if (userName && password) {
    headers.set("Authorization", "Basic " + btoa(`${userName}:${password}`));
  }
  return new Promise((resolve, reject) => {
    fetch(url, {
      method,
      headers,
      body: payload ? JSON.stringify(payload) : null,
    }).then((res) => {
      if (res.status === 409) {
        return resolve(payload);
      } else {
        return resolve(res.json());
      }
    });
  });
};

export const getToken = (id) =>
  fetchAuth({
    url: `${openviduUrl}/api/sessions`,
    payload: { customSessionId: id },
    userName: openviduUsername,
    password: openviduPassword,
  }).then(() =>
    fetchAuth({
      url: `${openviduUrl}/api/tokens`,
      payload: { session: id },
      userName: openviduUsername,
      password: openviduPassword,
    })
  );

// Arrays

export const shuffle = (arr) => arr.sort(() => Math.random() - 0.5);

export const any = (arr) => shuffle(arr)[0];

export const uniqueArray = (arr) => [...new Set(arr)];

export const uniqueCollection = (arr, key) => {
  const result = [];
  const map = new Map();
  for (const item of arr) {
    if (!map.has(item[key])) {
      map.set(item[key], true);
      result.push(item);
    }
  }
  return result;
};

export const removeFromArray = (arr, callback) => {
  const index = arr.findIndex(callback);
  if (index > -1) {
    return arr.splice(index, 1);
  }
};

export const upsertArray = (arr, callback, newItem) => {
  const index = arr.findIndex(callback);
  if (index > -1) {
    return arr.splice(index, 1, newItem);
  } else {
    return [...arr, newItem];
  }
};

// Strings

export const randomId = (length = 16) => {
  const letters = "abcdefghijklmnopqrstuvwxyz".split("");
  return shuffle(letters).slice(0, length).join("");
};

// Time

export const useSetInterval = (callback, nth, condition, timeout) => {
  let a = 0;
  const interval = ref(null);
  onMounted(() => {
    interval.value = setInterval(() => {
      const n = isRef(nth) ? nth.value : nth;
      a = a >= n - 1 ? 0 : a + 1;
      const cond = isRef(condition) ? condition.value : condition;
      if (a === 0 && cond) {
        callback();
      }
    }, timeout);
  });
  onUnmounted(() => {
    if (interval.value) {
      clearInterval(interval.value);
    }
  });
  return interval;
};

function Events() {
  return {
    all: (n = n || new Map()),
    on: function (t, e) {
      var i = n.get(t);
      (i && i.push(e)) || n.set(t, [e]);
    },
    emit: function (t, e) {
      (n.get(t) || []).slice().map(function (n) {
        n(e);
      }),
        (n.get("*") || []).slice().map(function (n) {
          n(t, e);
        });
    },
  };
}

export const events = mitt();

export const objectMap = (obj, callback) =>
  Object.fromEntries(Object.entries(obj).map(callback));

const parseSheet = (data) => {
  const title = data.feed.title.$t;
  const rows = data.feed.entry.map((entry) => {
    return Object.keys(entry)
      .map((field) => {
        if (field.startsWith("gsx$")) {
          return [field.split("$")[1], entry[field].$t];
        }
      })
      .filter((field) => field)
      .reduce((field, item) => {
        field[item[0]] = item[1];
        return field;
      }, {});
  });
  return { title, rows };
};

export const getSheet = (id) => {
  return fetch(
    `https://spreadsheets.google.com/feeds/list/${id}/od6/public/values?alt=json`
  )
    .then((res) => res.json())
    .then((res) => parseSheet(res));
};
