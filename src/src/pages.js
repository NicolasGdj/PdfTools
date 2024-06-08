module.exports = [
  {
    root: "/",
    view: "index",
    page: "pages/main",
    data: {
      title: "pages.main.title",
      css: ["pages/main.css"],
      js: ["pages/main.js"],
    },
  },
  {
    root: "/join",
    view: "index",
    page: "pages/join",
    data: {
      title: "pages.join.title",
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
      title: "pages.split.title",
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
      title: "pages.reorder.title",
      css: ["components/upload.css", "components/sortable.css"],
      js: ["sessions.js", "components/upload.js", "components/sortable.js", "pages/reorder.js"],
    },
  },
];
