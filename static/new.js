async function save() {
  const content = hiddenInput.value.trimEnd();
  if (!content) {
    return;
  }
  try {
    saveButton.classList.add("w3-disabled");
    const id = optionElements.id.value.trim();
    const ephemeral = optionElements.ephemeral.checked;
    let expireAt = null;
    if (optionElements.expire.checked) {
      let date = optionElements.expireAtDate.valueAsNumber;
      let time = optionElements.expireAtTime.value;
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
        ...(id && { id }),
        filename: optionElements.filename.value.trim(),
        highlighting_language: optionElements.highlightingLanguage.value,
        ephemeral: ephemeral,
        expire_at: expireAt,
      }),
    });

    if (!response.ok) {
      switch (response.status) {
        case 409:
          alert("ID already exists. Please choose another ID.");
          break;

        default:
          alert("An unexpected error occurred. Please try again or report a bug with logs.");
          break;
      }
      return;
    }

    const data = await response.json();

    if (ephemeral) {
      await navigator.clipboard.writeText(`${window.location.href}doc/${data.id}`);
      alert("Link copied to clipboard. This link can only be used once.");
    } else {
      window.location.pathname += `doc/${data.id}`;
    }
  } finally {
    saveButton.classList.remove("w3-disabled");
  }
}

function fileToContent(file) {
  if (!file || (!file.type.startsWith("text/") && !file.type.endsWith("json") && !file.type.endsWith("javascript"))) {
    return;
  }
  optionElements.filename.value = file.name;
  const reader = new FileReader();
  reader.onload = (event) => {
    hiddenInput.value = event.target.result;
    updateInput();
  };
  reader.readAsText(file);
}

function uploadFile() {
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.click();
  fileInput.onchange = () => {
    const file = fileInput.files[0];
    fileToContent(file);
  };
}

function syncScroll() {
  highlightedInput.firstChild.scrollLeft = hiddenInput.scrollLeft;
}

function updateInput() {
  hiddenInput.rows = hiddenInput.value.split("\n").length;
  highlightedInput.style.height = document.getElementById("content").style.height =
    hiddenInput.scrollHeight.toString() + "px";

  if (hiddenInput.value === "") {
    hiddenInput.style.color = "white";
    saveButton.classList.add("w3-disabled");
  } else {
    hiddenInput.style.color = "transparent";
    saveButton.classList.remove("w3-disabled");
  }

  // Extra newline as a workaround for trailing newline not showing in code element.
  highlightedInput.firstChild.textContent = hiddenInput.value + "\n";
  highlightedInput.firstChild.classList.remove(...highlightedInput.firstChild.classList);
  if (hljs.listLanguages().includes(optionElements.highlightingLanguage.value)) {
    highlightedInput.firstChild.classList.add("hljs");
    highlightedInput.firstChild.classList.add(`language-${optionElements.highlightingLanguage.value}`);
  }
  hljs.highlightElement(highlightedInput.firstChild);
  syncScroll();
}

function handleTab(event) {
  if (event.key === "Tab") {
    event.preventDefault();
    const tab = "  ";
    const code = event.target.value;
    const beforeTab = code.slice(0, event.target.selectionStart);
    const afterTab = code.slice(event.target.selectionEnd, event.target.value.length);
    const cursorPos = event.target.selectionStart + tab.length;
    event.target.value = beforeTab + tab + afterTab;
    event.target.selectionStart = cursorPos;
    event.target.selectionEnd = cursorPos;
    updateInput();
  }
}

function handleShortcuts(event) {
  if (event.ctrlKey) {
    switch (event.key) {
      case "s":
        event.preventDefault();
        save();
        break;
    }
  }
}

function load() {
  const documentDataJson = localStorage.getItem("document-data");
  if (documentDataJson) {
    const documentData = JSON.parse(documentDataJson);
    hiddenInput.value = documentData.content;
    optionElements.filename.value = documentData.filename;
    localStorage.removeItem("document-data");
  }
  hiddenInput.selectionEnd = 0;
  updateInput();

  const languages = ["[auto]", ...hljs.listLanguages()];
  for (const language of languages) {
    const option = document.createElement("option");
    option.value = language !== "[auto]" ? language : "";
    option.innerText = language;
    optionElements.highlightingLanguage.appendChild(option);
  }
}

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

const hiddenInput = document.getElementById("hidden-input");
const highlightedInput = document.getElementById("highlighted-input");
const saveButton = document.getElementById("save-button");
const optionElements = {
  filename: document.getElementById("option-filename"),
  id: document.getElementById("option-id"),
  highlightingLanguage: document.getElementById("option-hl-lang"),
  ephemeral: document.getElementById("option-ephemeral"),
  expire: document.getElementById("option-expire"),
  expireAtDate: document.getElementById("option-expire-at-date"),
  expireAtTime: document.getElementById("option-expire-at-time"),
}

hiddenInput.addEventListener("input", updateInput);
hiddenInput.addEventListener("scroll", syncScroll);
hiddenInput.addEventListener("keydown", handleTab);

window.addEventListener("keydown", handleShortcuts);
window.addEventListener("load", load);
