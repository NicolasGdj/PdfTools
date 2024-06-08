const sortable = new Sortable(document.getElementById("selectable"), { draggable: false });

let uploadedFile = null;

const upload = new UploadFile(document.body, {
  multiple: false,
  input: document.getElementById("upload-input-btn"),
  onError: (message) => {
    toastError(message);
  },
  onUpload: async (files) => {
    for (const file of files) {
      try {
        let preview = await upload.preview(file);
        uploadedFile = file;
        const selectable = document.getElementById("selectable");
        selectable.innerHTML = "";
        let pageNumber = 1;
        for (const page of preview.pages) {
          const div = document.createElement("div");
          div.classList.add("page");
          div.dataset.position = pageNumber - 1;
          div.dataset.id = pageNumber;
          const content = document.createElement("div");
          content.classList.add("page-content");
          const image = document.createElement("img");
          image.src = page;
          const span = document.createElement("span");
          span.classList.add("page-number");
          span.innerText = pageNumber + "/" + preview.pages.length;
          content.appendChild(image);
          content.appendChild(span);
          div.appendChild(content);
          selectable.appendChild(div);
          ++pageNumber;
        }
        toastSuccess("File uploaded successfully");
      } catch (error) {
        toastError(error.message);
        console.error("Error while uploading file: ", error);
      }
    }
  },
});
const selectable = new Selectable(document.getElementById("selectable"));

window.addEventListener("DOMContentLoaded", async () => {
  document.getElementById("submit-btn").addEventListener("click", async () => {
    try {
      console.log(selectable.getResults());
      const results = selectable.getResults();
      let pages = [];
      for (const key in results) {
        if (results[key] === true) {
          pages.push(Number(key));
        }
      }
      if (!uploadedFile) {
        toastError("File not uploaded");
        return;
      }

      if (pages.length === 0) {
        toastError("Pages not selected");
        return;
      }

      const response = await upload.split(uploadedFile, pages);
      const a = document.createElement("a");
      a.href = response.uri;
      a.download = "splited.pdf";
      a.click();
      URL.revokeObjectURL(a.href);
      toastSuccess("Files splited successfully");
    } catch (error) {
      toastError(error.message);
      console.error("Error while joining files: ", error);
    }
  });
});
