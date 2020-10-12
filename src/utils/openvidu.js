import axios from "https://cdn.skypack.dev/pin/axios@v0.20.0-LOBv4rtrPNcfEDCm7t9v/min/axios.js"

const OPENVIDU_SERVER_URL = 'https://elektron.studio'
const OPENVIDU_SERVER_SECRET = 'secret'

export function getToken(mySessionId) {
  return createSession(mySessionId).then((sessionId) =>
    createToken(sessionId)
  );
},

function createSession(sessionId) {
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
            password: OPENVIDU_SERVER_SECRET
          },
        }
      )
      .then((response) => response.data)
      .then((data) => resolve(data.id))
      .catch((error) => {
        if (error.response.status === 409) {
          resolve(sessionId);
        } else {
          console.warn(
            `No connection to OpenVidu Server. This may be a certificate error at ${OPENVIDU_SERVER_URL}`
          );
          if (
            window.confirm(
              `No connection to OpenVidu Server. This may be a certificate error at ${OPENVIDU_SERVER_URL}\n\nClick OK to navigate and accept it. If no certificate warning is shown, then check that your OpenVidu Server is up and running at "${OPENVIDU_SERVER_URL}"`
            )
          ) {
            location.assign(`${OPENVIDU_SERVER_URL}/accept-certificate`);
          }
          reject(error.response);
        }
      });
  });
},

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
},
