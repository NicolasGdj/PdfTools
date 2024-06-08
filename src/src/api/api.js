const router = require("express").Router();
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const path = require("path");
const { fromPath } = require("pdf2pic");
const pdf = require("pdf-parse");

const { exists: isSessionExist } = require("../utils/sessions");

router.use("/sessions", require("./sessions"));

async function isPdf(buffer) {
  try {
    await pdf(buffer);
    return true;
  } catch (err) {
    return false;
  }
}
const MAX_SIZE = 30 * 1024 * 1024; // 30MB
router.post("/join", async (req, res) => {
  const PDFMerger = (await import("pdf-merger-js")).default;

  if (!req.files || !req.files.files) {
    return res.status(400).send({ status: false, message: "No PDF files uploaded" });
  }

  if (!(req.files.files instanceof Array) || req.files.files.length < 2) {
    return res.status(400).send({ status: false, message: "At least two PDF files are required" });
  }
  const session = req.body.session;
  if (!session) {
    return res.status(400).json({ status: false, message: "Session ID is required" });
  }
  const dirPath = isSessionExist(session);
  if (!dirPath) {
    return res.status(400).json({ status: false, message: "Session timeout" });
  }
  const uuid = uuidv4();
  const outputDir = path.join(dirPath, `join-${uuid}`);
  fs.mkdirSync(outputDir, { recursive: true });

  let merger = new PDFMerger();

  const pdfFiles = req.files.files;
  let pdfPaths = [];
  for (const pdfFile of pdfFiles) {
    if (pdfFile.size > MAX_SIZE) {
      return res
        .status(400)
        .send({ status: false, message: "PDF file size exceeds the maximum limit." });
    }

    if (!(await isPdf(pdfFile.data))) {
      return res.status(400).send({ status: false, message: "No PDF file uploaded. (2)" });
    }

    const pdfPath = path.join(dirPath, `${pdfFile.name}`);
    pdfPaths.push(pdfPath);
    try {
      await pdfFile.mv(pdfPath);
    } catch (err) {
      return res.status(500).send({ status: false, message: "Failed to upload PDF file" });
    }

    await merger.add(pdfPath);
  }

  try {
    await merger.setMetadata({
      producer: "PDFTools",
      author: "PDFTools",
      creator: "PDFTools",
      title: "Merged PDF",
    });

    const filename = `merged-${uuidv4()}.pdf`;
    const filepath = path.join(outputDir, filename);
    await merger.save(filepath);
    res
      .status(200)
      .json({ status: true, file: `/assets/uploads/${session}/join-${uuid}/${filename}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: "Failed to join files" });
  } finally {
    pdfPaths.forEach((pdfPath) => {
      fs.rmSync(pdfPath, { force: true });
    });
  }
});

router.post("/split", async (req, res) => {
  const PDFMerger = (await import("pdf-merger-js")).default;

  if (!req.files || !req.files.file) {
    return res.status(400).send({ status: false, message: "No PDF file uploaded" });
  }

  const pdfFile = req.files.file;
  if (pdfFile.size > MAX_SIZE) {
    return res
      .status(400)
      .send({ status: false, message: "PDF file size exceeds the maximum limit." });
  }

  if (!(await isPdf(pdfFile.data))) {
    return res.status(400).send({ status: false, message: "No PDF file uploaded. (2)" });
  }

  const session = req.body.session;
  if (!session) {
    return res.status(400).json({ status: false, message: "Session ID is required" });
  }
  const dirPath = isSessionExist(session);
  if (!dirPath) {
    return res.status(400).json({ status: false, message: "Session timeout" });
  }
  const uuid = uuidv4();
  const outputDir = path.join(dirPath, `split-${uuid}`);
  const pdfPath = path.join(outputDir, `${uuid}.pdf`);
  fs.mkdirSync(outputDir, { recursive: true });

  let pages;
  if (req.body.pages) {
    if (Array.isArray(req.body.pages)) {
      pages = req.body.pages.map(Number);
    } else if (!isNaN(req.body.pages)) {
      pages = [req.body.pages];
    } else {
      return res.status(400).json({ status: false, message: "Invalid pages numbers" });
    }
  } else {
    return res.status(400).json({ status: false, message: "Pages numbers are required" });
  }

  try {
    await pdfFile.mv(pdfPath);
  } catch (err) {
    return res.status(500).send({ status: false, message: "Failed to upload PDF file" });
  }
  let merger = new PDFMerger();

  for (const page of pages) {
    await merger.add(pdfPath, page);
  }

  try {
    await merger.setMetadata({
      producer: "PDFTools",
      author: "PDFTools",
      creator: "PDFTools",
      title: "Splited PDF",
    });

    const filename = `splited-${uuidv4()}.pdf`;
    const filepath = path.join(outputDir, filename);
    await merger.save(filepath);
    res
      .status(200)
      .json({ status: true, file: `/assets/uploads/${session}/split-${uuid}/${filename}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: "Failed to split files" });
  } finally {
    fs.rmSync(pdfPath, { force: true });
  }
});

router.post("/preview", async (req, res) => {
  if (!req.files || !req.files.file) {
    return res.status(400).send({ status: false, message: "No PDF file uploaded. (1)" });
  }

  const pdfFile = req.files.file;

  if (pdfFile.size > MAX_SIZE) {
    return res
      .status(400)
      .send({ status: false, message: "PDF file size exceeds the maximum limit." });
  }

  if (!(await isPdf(pdfFile.data))) {
    return res.status(400).send({ status: false, message: "No PDF file uploaded. (2)" });
  }
  const session = req.body.session;

  if (!session) {
    return res.status(400).json({ status: false, message: "Session ID is required" });
  }
  const dirPath = isSessionExist(session);
  if (!dirPath) {
    return res.status(400).json({ status: false, message: "Session timeout" });
  }
  const uuid = uuidv4();
  const pdfPath = path.join(dirPath, `${uuid}.pdf`);
  const outputDir = path.join(dirPath, `preview-${uuid}`);

  let pageNumber = -1;
  if (req.body.pages) {
    if (Array.isArray(req.body.pages)) {
      pageNumber = req.body.pages.map(Number);
    } else if (!isNaN(req.body.pages)) {
      pageNumber = req.body.pages;
    }
  }

  fs.mkdirSync(outputDir, { recursive: true });

  pdfFile.mv(pdfPath, async (err) => {
    if (err) {
      return res.status(500).send({ status: false, message: "Failed to upload PDF file" });
    }

    const options = {
      density: 100,
      saveFilename: "page",
      savePath: outputDir,
      format: "png",
      width: 400,
      height: 565.6,
    };

    const convert = fromPath(pdfPath, options);

    try {
      const pages = await convert.bulk(pageNumber, { responseType: "image" });
      const pageUrls = pages.map(
        (page) => `/assets/uploads/${session}/preview-${uuid}/${page.name}`
      );
      res.status(200).json({ status: true, name: pdfFile.name, pages: pageUrls });
    } catch (error) {
      console.error(error);
      res.status(500).json({ status: false, message: "Failed to generate preview" });
    } finally {
      fs.rmSync(pdfPath, { force: true });
    }
  });
});

router.post("/upload", async (req, res) => {});

module.exports = router;
