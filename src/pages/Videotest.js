//import { fetchAuth } from "../utils/index.js";

//const url = "https://elektron.studio/api/sessions";

// fetchAuth(
//   url,
//   {
//     customSessionId: "hello",
//   },
//   "OPENVIDUAPP",
//   "secret"
// )
//   .then((res) => console.log(res))
//   .catch((e) => console.log(e));

// let username = "john";
// let password = "doe";
// let url = `https://httpbin.org/basic-auth/${username}/${password}`;
// let authString = `${username}:${password}`;
// let headers = new Headers();
// headers.set("Authorization", "Basic " + btoa(authString));
// fetch(url, { method: "GET", headers: headers }).then(function (response) {
//   console.log(response);
//   return response;
// });

const fetchAuth = (url, payload = {}, username, password, method = "POST") => {
  let headers = new Headers();
  headers.set("Authorization", "Basic " + btoa(`${username}:${password}`));
  headers.set("content-type", "application/json");
  return fetch(url, {
    method: "POST",
    body: JSON.stringify(payload),
    headers,
  }).then((res) => res.json());
};

fetchAuth(
  "https://elektron.studio/api/sessions",
  { customSessionId: "yo" },
  "OPENVIDUAPP",
  "secret"
).then((res) => console.log(res));
//
export default {
  template: `
  <div class="live-layout">
  </div>
  `,
};
