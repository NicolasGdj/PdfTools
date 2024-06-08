const sortable = new Sortable(document.getElementById("sortable"));
const uploadedFiles = {};
const upload = new UploadFile(document.body, {
  multiple: true,
  input: document.getElementById("upload-input-btn"),
  onError: (message) => {
    toastError(message);
  },
  onUpload: async (files) => {
    for (const file of files) {
      try {
        let preview = await upload.preview(file, 1);
        const sortable = document.getElementById("sortable");
        let pageNumber = sortable.children.length + 1;
        uploadedFiles[pageNumber] = { id: pageNumber, file: file, preview: preview };
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
          span.innerText = preview.name;
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
      const results = sortable.getResults((element) => uploadedFiles[element]);
      console.log("Results: ", results);
      const orderedFiles = Object.values(results).map((result) => result.file);
      const response = await upload.join(orderedFiles);
      const a = document.createElement("a");
      a.href = response.uri;
      a.download = "merged.pdf";
      a.click();
      URL.revokeObjectURL(a.href);
      toastSuccess("Files joined successfully");
    } catch (error) {
      toastError(error.message);
      console.error("Error while joining files: ", error);
    }
  });
});
