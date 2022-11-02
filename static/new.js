async function save() {
  const content = document.getElementById("input").value.trimEnd();
  if (!content) {
    return;
  }
  document.getElementById("save-button").classList.add("w3-disabled");

  // const id = document.getElementById("option-id").value.trim();
  const ephemeral = document.getElementById("option-ephemeral").checked;
  let expireAt = null;
  if (document.getElementById("option-expire").checked) {
    let date = document.getElementById("option-expire-at-date").valueAsNumber;
    let time = document.getElementById("option-expire-at-time").value;
    if (date && time) {
      date = date / 1000;
      time = time.split(":");
      expireAt = date + parseInt(time[0]) * 60 * 60 + parseInt(time[1]) * 60;
    }
  }

  const response = await fetch("/api/new", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content: content,
      filename: document.getElementById("option-filename").value.trim(),
      ephemeral: ephemeral,
      // id: id ? id : null,
      expire_at: expireAt,
    }),
  });

  const data = await response.json();
  if (ephemeral) {
    await navigator.clipboard.writeText(window.location.href + data.id);
    alert("Link copied to clipboard. This link can only be used once.");
  } else {
    window.location.pathname += data.id;
  }
  document.getElementById("save-button").classList.remove("w3-disabled");
}

async function fileToContent(file) {
  if (!file || !file.type.startsWith("text/")) {
    return;
  }
  document.getElementById("option-filename").value = file.name;
  const reader = new FileReader();
  reader.onload = (event) => {
    const content = document.getElementById("input");
    content.value = event.target.result;
    content.style.height = content.scrollHeight.toString() + "px";
  };
  reader.readAsText(file);
}

async function uploadFile() {
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.click();
  fileInput.onchange = async () => {
    const file = fileInput.files[0];
    fileToContent(file);
  };
}

async function load() {
  const input = document.getElementById("hidden-input");
  const documentDataJson = localStorage.getItem("document-data");
  if (documentDataJson) {
    const documentData = JSON.parse(documentDataJson);
    input.value = documentData.content;
    input.style.height = input.scrollHeight + "px";
    document.getElementById("option-filename").value = documentData.filename;
    localStorage.removeItem("document-data");
  }
  input.selectionEnd = 0;
}

window.addEventListener("keydown", (event) => {
  if (event.ctrlKey) {
    switch (event.key) {
      case "s":
        event.preventDefault();
        save();
        break;
    }
  }
});

document.body.ondragover = (event) => {
  event.preventDefault();
};

document.body.ondrop = (event) => {
  event.preventDefault();
  let file;
  if (event.dataTransfer.items && event.dataTransfer.items[0].kind === "file") {
    file = event.dataTransfer.items[0].getAsFile();
  } else {
    file = event.dataTransfer.files[0];
  }
  fileToContent(file);
};

window.addEventListener("load", load);

// -----------------------------

function update() {
  hiddenInput.style.height = hiddenInput.scrollHeight + "px";
  highlightedInput.firstChild.textContent = hiddenInput.value;
  highlightedInput.firstChild.classList.remove(...highlightedInput.firstChild.classList);
  hljs.highlightElement(highlightedInput.firstChild);
  syncScroll();
}

function syncScroll() {
  highlightedInput.scrollTop = hiddenInput.scrollTop;
  highlightedInput.scrollLeft = hiddenInput.scrollLeft;
}

function handleTab(event) {
  if (event.key == "Tab") {
    event.preventDefault();
    const tab = "    ";
    const code = element.value;
    const beforeTab = code.slice(0, element.selectionStart);
    const afterTab = code.slice(element.selectionEnd, element.value.length);
    const cursorPos = element.selectionStart + tab.length;
    element.value = beforeTab + tab + afterTab;
    element.selectionStart = cursorPos;
    element.selectionEnd = cursorPos;
    update();
  }
}

const hiddenInput = document.getElementById("hidden-input");
const highlightedInput = document.getElementById("highlighted-input");

hiddenInput.addEventListener("input", update);
hiddenInput.addEventListener("scroll", syncScroll);
hiddenInput.addEventListener("keydown", handleTab);
