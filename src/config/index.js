import { uuidv4 } from "../utils/index.js";

export const mainInputUrl = (id) =>
  `https://elektron-live.babahhcdn.com/bb1150-le/${id}/index.m3u8`;
export const specOutputUrl =
  "https://elektron-live.babahhcdn.com/bb1150-le/spectators/index.m3u8";
export const specInputmUrl =
  "wss://fo1.babahhcdn.com/elektron/" + uuidv4() + "?password=tron";
export const chatUrl = "wss://ws-fggq5.ondigitalocean.app";
export const eventsUrl =
  "https://www.googleapis.com/calendar/v3/calendars/mkr5k66b069hve1f7aa77m4bsc@group.calendar.google.com/events?key=AIzaSyAkeDHwQgc22TWxi4-2r9_5yMWVnLQNMXc";
