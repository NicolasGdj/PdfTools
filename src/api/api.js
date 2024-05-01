const router = require("express").Router();
const { v4 } = require("uuid");
const fs = require("fs");
const path = require("path");
module.exports = router;

const { exists: isSessionExist } = require("../utils/sessions");
const { convert } = require("pdf-poppler");

router.use("/sessions", require("./sessions"));

router.post("/preview", async (req, res) => {
  if (!req.files || !req.files.pdf) {
    return res.status(400).send({ status: false, message: "No PDF file uploaded." });
  }
  const session = req.body.session;

  if (!session) {
    return res.status(400).json({ status: false, message: "Session ID is required" });
  }
  const dirPath = isSessionExist(session);
  if (!dirPath) {
    return res.status(400).json({ status: false, message: "Session timeout" });
  }
  const uuid = v4();
  const pdfPath = path.join(dirPath, `${uuid}.pdf`);

  req.files.pdf.mv(pdfPath, (err) => {
    if (err) {
      return res.status(500).send({ status: false, message: "Failed to upload PDF file" });
    }
    const previewDirName = `preview-${uuid}`;
    const outputDir = path.join(dirPath, previewDirName);
    fs.mkdirSync(outputDir);
    convert(pdfPath, { format: "jpeg", out_dir: outputDir, out_prefix: "page" })
      .then(() => {
        const imageFiles = fs.readdirSync(outputDir).sort((a, b) => {
          const numA = parseInt(a.match(/\d+/)[0]);
          const numB = parseInt(b.match(/\d+/)[0]);
          return numA - numB;
        });

        const pages = imageFiles.map(
          (file) => `/assets/uploads/${session}/preview-${uuid}/${file}`
        );

        res.status(200).json({ status: true, pages: pages });
      })
      .catch((error) => {
        console.error(error);
        res.status(500).json({ status: false, message: "Failed to generate preview" });
      })
      .finally(() => {
        fs.rmSync(pdfPath);
      });
  });
});
