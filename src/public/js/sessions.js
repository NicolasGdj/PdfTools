let currentSession = null;
const socket = io();

const joinSession = (session) => {
  currentSession = { id: session, lastUpdate: new Date().getTime() };
};

socket.on("session", (session) => {
  if (!session) return;
  joinSession(session);
});
