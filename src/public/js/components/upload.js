class UploadFile {
  constructor(element, options = {}) {
    const defaultOptions = {
      multiple: false,
      onUpload: (files) => {
        console.log("Uploaded files: ", files);
      },
      onError: (error) => {
        console.error("Error while uploading files: ", error);
      },
      input: null,
    };
    this.element = element;
    this.options = { ...defaultOptions, ...options };
    element.addEventListener("drop", this.dropHandler.bind(this));
    element.addEventListener("dragover", this.dragOverHandler.bind(this));
    element.addEventListener("dragleave", this.dragLeaveHandler.bind(this));
    if (this.options.input) {
      //Ask for file input
      // When we click on the button, open a file input dialog
      this.options.input.addEventListener("click", () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".pdf";
        input.multiple = this.options.multiple;
        input.addEventListener("change", (event) => {
          this.options.onUpload(event.target.files);
        });
        input.click();
      });
    }
  }

  dropHandler(event) {
    event.preventDefault();
    this.element.classList.remove("uploading");
    const files = event.dataTransfer.files;
    if (files.length === 0) return;
    if (this.options.multiple === false && files.length > 1) {
      if (this.options.onError) this.options.onError("Only one file is allowed");
      return;
    }
    if (this.options.onUpload) this.options.onUpload(files);
  }

  dragOverHandler(event) {
    event.preventDefault();
    this.element.classList.add("uploading");
  }

  dragLeaveHandler(event) {
    event.preventDefault();
    this.element.classList.remove("uploading");
  }

  async preview(file, page = 0) {
    if (!currentSession) {
      throw new Error("No session available");
    }
    const formData = new FormData();
    formData.append("file", file);
    formData.append("session", currentSession.id);
    if (page > 0) formData.append("pages", page);
    const response = await fetch("/api/v1/preview", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!data.status) {
      throw new Error("Failed to upload file: " + data.message);
    } else if (!response.ok) {
      throw new Error("Failed to upload file");
    }
    return { name: data.name, pages: data.pages };
  }

  async join(files) {
    console.log("Joining files: ", files);
    if (!currentSession) {
      throw new Error("No session available");
    }

    const formData = new FormData();
    for (const file of files) formData.append("files", file);
    formData.append("session", currentSession.id);
    let response;
    let data;
    try {
      response = await fetch("/api/v1/join", {
        method: "POST",
        body: formData,
      });
      data = await response.json();
    } catch (error) {
      throw new Error("Failed to upload file");
    }
    if (!data.status) {
      throw new Error("Failed to upload file: " + data.message);
    } else if (!response.ok) {
      throw new Error("Failed to upload file");
    }
    return { uri: data.file };
  }

  async split(file, pages) {
    console.log("Spliting file: ", file);
    if (!currentSession) {
      throw new Error("No session available");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("session", currentSession.id);
    for (const page of pages) formData.append("pages", page);
    let response;
    let data;
    try {
      response = await fetch("/api/v1/split", {
        method: "POST",
        body: formData,
      });
      data = await response.json();
    } catch (error) {
      throw new Error("Failed to upload file");
    }
    if (!data.status) {
      throw new Error("Failed to upload file: " + data.message);
    } else if (!response.ok) {
      throw new Error("Failed to upload file");
    }
    return { uri: data.file };
  }
}
