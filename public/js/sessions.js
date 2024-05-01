let currentSession = null;
let sessionTimeoutId = null;
const SESSION_TIMEOUT = 1000 * 60 * 10;

const updateTimeoutSession = () => {
  if (sessionTimeoutId) clearTimeout(sessionTimeoutId);
  sessionTimeoutId = setTimeout(() => {
    console.log("sessions timeout");
    leaveSession(currentSession);
    alert("Session expired");
    location.reload();
  }, SESSION_TIMEOUT);
};

document.addEventListener("mousemove", updateTimeoutSession);

const joinSession = (session) => {
  if (currentSession) leaveSession(currentSession);
  const sessions = JSON.parse(localStorage.getItem("sessions")) || [];
  currentSession = { id: session, lastUpdate: new Date().getTime() };
  sessions.push(currentSession);
  localStorage.setItem("sessions", JSON.stringify(sessions));
  console.log("join session", currentSession);
  console.log("sessions", sessions);
  updateTimeoutSession();
};

const leaveSession = async (session) => {
  const sessions = JSON.parse(localStorage.getItem("sessions")) || [];

  const sessionsToRemove = sessions
    .filter((s) => s.id === session.id || s.lastUpdate + SESSION_TIMEOUT <= new Date().getTime())
    .map((s) => s.id);
  if (sessionsToRemove.length === 0) return;

  fetch("/api/v1/sessions", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sessions: sessionsToRemove,
    }),
  }).catch((error) => {
    console.error("Error:", error);
  });

  localStorage.setItem(
    "sessions",
    JSON.stringify(
      sessions.filter(
        (s) => s.id !== session.id && s.lastUpdate + SESSION_TIMEOUT > new Date().getTime()
      )
    )
  );
  currentSession = null;
};

fetch("/api/v1/sessions", {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
  },
})
  .then((response) => {
    if (response.ok) {
      return response.json();
    }
  })
  .then((data) => {
    if (!data || !data.id) return;
    joinSession(data.id);
  })
  .catch((error) => {
    console.error("Error:", error);
  });

window.addEventListener("beforeunload", function (e) {
  console.log("leave sessions");
  if (!currentSession) return;
  leaveSession(currentSession);
});
