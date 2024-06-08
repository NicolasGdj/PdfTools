function toastError(message) {
  M.toast({ html: message, classes: "red" });
}

function toastSuccess(message) {
  M.toast({ html: message, classes: "green" });
}

function toastInfo(message) {
  M.toast({ html: message });
}

document.addEventListener("DOMContentLoaded", function () {
  M.Sidenav.init(document.querySelectorAll(".sidenav"), {});
});
