const uuidv4 = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const mainInputUrl = (id) =>
  `https://elektron-live.babahhcdn.com/bb1150-le/${id}/index.m3u8`;

export const experimentalInputUrl = (id) =>
  `https://stream.elektron.studio:8443/live/${id}.m3u8`;

export const specOutputUrl =
  "https://elektron-live.babahhcdn.com/bb1150-le/spectators/index.m3u8";
export const specInputmUrl =
  "wss://fo1.babahhcdn.com/elektron/" + uuidv4() + "?password=tron";
export const chatUrl = "wss://ws-fggq5.ondigitalocean.app";
export const eventsUrl =
  "https://www.googleapis.com/calendar/v3/calendars/mkr5k66b069hve1f7aa77m4bsc@group.calendar.google.com/events?key=AIzaSyAkeDHwQgc22TWxi4-2r9_5yMWVnLQNMXc";

export const openviduUrl = "https://elektron.studio";
export const openviduUsername = "OPENVIDUAPP";
export const openviduPassword = "secret";

export const openviduWidth = 80;
export const openviduHeight = 60;
export const openviduFps = 12;

export const imageScale = 1 / 4;
export const imageQuality = 0.8;
export const imageUpdateFrequency = 1000;
