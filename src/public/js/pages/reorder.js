const sortable = new Sortable(document.getElementById("sortable"));
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
        const sortable = document.getElementById("sortable");
        sortable.innerHTML = "";
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
          sortable.appendChild(div);
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

window.addEventListener("DOMContentLoaded", async () => {
  document.getElementById("submit-btn").addEventListener("click", async () => {
    try {
      const results = sortable.getResults((element) => Number(element));
      const pages = Object.values(results);
      if (!uploadedFile || pages.length === 0) {
        toastError("File not uploaded");
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
