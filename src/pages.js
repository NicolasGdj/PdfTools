const { json } = require("body-parser");

module.exports = [
  {
    root: "/",
    view: "index",
    page: "main",
    data: {
      title: "Home Page",
      css: ["pages/main.css"],
      js: ["pages/main.js"],
    },
  },
  {
    root: "/join",
    view: "index",
    page: "join",
    data: {
      title: "Join PDF",
      css: ["pages/join.css"],
      js: ["sessions.js", "pages/join.js"],
    },
  },
];
