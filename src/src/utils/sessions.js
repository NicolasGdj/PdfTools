const { v4 } = require("uuid");
const fs = require("fs");
const path = require("path");

const tempDir = path.join(__dirname, "..", "..", "public", "uploads");
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

function init(io) {
  io.on("connection", (socket) => {
    const session = create();
    socket.emit("session", session);
    socket.on("disconnect", () => {
      deleteSession(session);
    });
  });
}

function create() {
  const session = v4();
  if (exists(session)) return false;
  const subDir = path.join(tempDir, session);
  fs.mkdirSync(subDir);
  return session;
}

function exists(session) {
  const sessionDir = path.join(tempDir, session);
  if (!sessionDir.startsWith(tempDir)) return false;

  if (!fs.existsSync(sessionDir)) return false;
  return sessionDir;
}

function deleteSession(session) {
  const sessionDir = exists(session);
  if (!sessionDir) return false;

  fs.rmSync(sessionDir, { recursive: true });
  return true;
}

function clear() {
  console.log("Clearing all sessions...");
  fs.rmSync(tempDir, { recursive: true });
  fs.mkdirSync(tempDir);
}

clear();

module.exports = {
  init: init,
  create: create,
  exists: exists,
  delete: deleteSession,
  clearAll: clear,
};
