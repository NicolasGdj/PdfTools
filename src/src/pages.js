module.exports = [
  {
    root: "/",
    view: "index",
    page: "pages/main",
    data: {
      title: "Home Page",
      css: ["pages/main.css"],
      js: ["pages/main.js"],
    },
  },
  {
    root: "/join",
    view: "index",
    page: "pages/join",
    data: {
      title: "Join PDF",
      css: ["components/upload.css", "components/sortable.css", "pages/join.css"],
      js: [
        "sessions.js",
        "components/upload.js",
        "components/selectable.js",
        "components/sortable.js",
        "pages/join.js",
      ],
    },
  },
  {
    root: "/split",
    view: "index",
    page: "pages/split",
    data: {
      title: "Split PDF",
      css: ["components/upload.css", "components/selectable.css", "components/sortable.css"],
      js: [
        "sessions.js",
        "components/upload.js",
        "components/selectable.js",
        "components/sortable.js",
        "pages/split.js",
      ],
    },
  },
  {
    root: "/reorder",
    view: "index",
    page: "pages/reorder",
    data: {
      title: "Reorder PDF",
      css: ["components/upload.css", "components/sortable.css"],
      js: ["sessions.js", "components/upload.js", "components/sortable.js", "pages/reorder.js"],
    },
  },
];
