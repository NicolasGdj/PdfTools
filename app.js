"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const app = express();
const i18n = require("i18n");

require("dotenv").config();

const { PORT } = process.env;
const server = require("http").createServer(app);

app.set("view engine", "ejs");

app.use("/assets", express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(fileUpload());

i18n.configure({
  locales: ["en", "fr"],
  defaultLocale: "en",
  cookie: "locale",
  directory: __dirname + "/locales",
});
app.use(i18n.init);

app.use("/api/v1", require("./src/api/api"));

const pages = require("./src/pages");

pages.forEach((page) => {
  app.get(page.root, async (request, response) => {
    response.render(page.view, page.data);
  });
});

server.listen(PORT, () => {
  console.log("Server listening on *:" + PORT);
});
