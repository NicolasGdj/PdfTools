const router = require("express").Router();
const { create: createSession, delete: deleteSession } = require("../utils/sessions");
module.exports = router;

router.get("/", async (req, res) => {
  const session = createSession();
  if (!session) {
    return res.status(500).send({ status: false, message: "Failed to create session" });
  }
  res.send({ status: true, id: session });
});

router.delete("/", async (req, res) => {
  const { sessions } = req.body;
  if (!sessions || !Array.isArray(sessions) || sessions.length === 0) {
    return res.status(400).send({ status: false, message: "Invalid sessions" });
  }
  for (let session of sessions) {
    if (
      typeof session !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(session)
    ) {
      return res.status(400).send({ status: false, message: "Invalid sessions" });
    }
  }
  for (let session of sessions) {
    if (!deleteSession(session)) {
      console.error("Failed to delete session", session);
    }
  }
  res.send({ status: true, message: "Sessions deleted" });
});
