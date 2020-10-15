import axios from "https://cdn.skypack.dev/pin/axios@v0.20.0-LOBv4rtrPNcfEDCm7t9v/min/axios.js";

axios.defaults.headers.post["Content-Type"] = "application/json";

const OPENVIDU_SERVER_URL = "https://elektron.studio";
const OPENVIDU_SERVER_SECRET = "secret";

export const getToken = (mySessionId) => {
  return createSession(mySessionId).then((sessionId) => createToken(sessionId));
};

function createSession(sessionId) {
  console.log(sessionId);
  return new Promise((resolve, reject) => {
    axios
      .post(
        `${OPENVIDU_SERVER_URL}/api/sessions`,
        JSON.stringify({
          customSessionId: sessionId,
        }),
        {
          auth: {
            username: "OPENVIDUAPP",
            password: OPENVIDU_SERVER_SECRET,
          },
        }
      )
      .then((response) => response.data)
      .then((data) => resolve(data.id))
      .catch((error) => {
        if (error.response.status === 409) {
          resolve(sessionId);
        } else {
          reject(error.response);
        }
      });
  });
}

function createToken(sessionId) {
  return new Promise((resolve, reject) => {
    axios
      .post(
        `${OPENVIDU_SERVER_URL}/api/tokens`,
        JSON.stringify({
          session: sessionId,
        }),
        {
          auth: {
            username: "OPENVIDUAPP",
            password: OPENVIDU_SERVER_SECRET,
          },
        }
      )
      .then((response) => response.data)
      .then((data) => resolve(data.token))
      .catch((error) => reject(error.response));
  });
}
