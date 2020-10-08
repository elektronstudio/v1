// function getToken(mySessionId) {
//   return this.createSession(mySessionId).then((sessionId) =>
//     this.createToken(sessionId)
//   );
// },

/*
createSession(sessionId) {
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
*/

/*
function createToken(serverUrl, serverSecret, sessionId) {
    const login = 'OPENVIDUAPP'
   return fetch(
        `${serverUrl}/api/tokens`
        {
          method: 'POST',
          body: 
        JSON.stringify({
          session: sessionId,
        }),
        headers: new Headers({
          "Authorization": `Basic ${base64.encode(`${login}:${serverSecret}`)}`,
          'content-type': 'application/json'
        })}
      )
      .then((res) => res.json())
   
}
*/
