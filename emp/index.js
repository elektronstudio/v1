import { renderEvent, render } from "../index.js";

// Getting event ID from URL

const id = window.location.pathname.replace(/\//g, "");
console.log(id);

const mainStreamUrl = `https://elektron-live.babahhcdn.com/bb1150-le/test/index.m3u8"`;

const spectactorsStreamUrl =
  "https://elektron-live.babahhcdn.com/bb1150-le/spectators/index.m3u8";

// Utility functions

function safeJsonParse(str) {
  try {
    return JSON.parse(str);
  } catch (err) {
    return null;
  }
}

// Rendering event info

renderEvent("event", id);

// Set up a websocket connection to our custom relay server
// https://github.com/elektronstudio/ws

const socket = new WebSocket("wss://ws-fggq5.ondigitalocean.app/");

socket.onmessage = ({ data }) => {
  const message = safeJsonParse(data);
  if (message && message.type === "statsResponse") {
    render("stats", message.clientsCount);
  }
};

let interval = null;

socket.onopen = () => {
  socket.send(JSON.stringify({ type: "statsRequest" }));
  interval = setInterval(
    () => socket.send(JSON.stringify({ type: "statsRequest" })),
    8000
  );
};

socket.onclose = () => clearInterval(interval);

function errorHandler() {
  console.log("main-stream.ready() called");

  this.player().on("error", function (e) {
    //console.log(e);
    e.stopImmediatePropagation();
    var error = this.player().error();
    console.log(
      "main-stream reload triggered (error): ",
      error.code,
      error.type,
      error.message
    );

    this.src(mainStreamUrl);
  });

  this.player()
    .tech(true)
    .on("retryplaylist", function (e) {
      e.stopImmediatePropagation();

      console.log("main-stream reload triggered (retryplaylist)");
      this.src(MainStream);
    });
}

function errorHandler2() {
  console.log("spectarot-stream.ready() called");

  this.player().on("error", function (e) {
    //console.log(e);
    e.stopImmediatePropagation();
    var error = this.player().error();
    console.log(
      "main-stream reload triggered (error): ",
      error.code,
      error.type,
      error.message
    );

    this.src(spectactorsStreamUrl);
  });

  this.player()
    .tech(true)
    .on("retryplaylist", function (e) {
      e.stopImmediatePropagation();
      console.log("main-stream reload triggered (retryplaylist)");
      this.src(spectactorsStreamUrl);
    });
}

function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const { Publisher, PUBLISHER_EVENTS, PLAYER_EVENTS } = window.FlussonicWebRTC;

window.getCamera = () => {
  const streamWSS =
    "wss://fo1.babahhcdn.com/elektron/" + uuidv4() + "?password=tron";
  console.log(streamWSS);

  const publisher = new Publisher(streamWSS, {
    previewOptions: {
      autoplay: true,
      controls: false,
      muted: true,
    },
    constraints: {
      video: true,
      audio: true,
    },
    onWebsocketClose: () => console.log("websocket closed"),
  });

  publisher.on(PUBLISHER_EVENTS.STREAMING, () => {
    console.log("Streaming started");
  });

  publisher.start();
};

window.onload = () => {
  // const mainStream = videojs("main-stream", {
  //   sources: [
  //     {
  //       src: mainStreamUrl,
  //       type: "application/x-mpegURL",
  //     },
  //   ],
  //   controls: true,
  //   autoplay: true,
  //   muted: true,
  // });
  // mainStream.ready(errorHandler);

  const spectatorStream = videojs("spectators-stream", {
    sources: [
      {
        src: spectactorsStreamUrl,
        type: "application/x-mpegURL",
      },
    ],
    controls: true,
    autoplay: true,
    muted: true,
  });
  spectatorStream.ready(errorHandler2);
};
