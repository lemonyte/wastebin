async function save() {
  const content = hiddenInput.value.trimEnd();
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

  const data = await (
    await fetch("/api/new", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: content,
        filename: document.getElementById("option-filename").value.trim(),
        highlighting_language: languageSelect.value,
        ephemeral: ephemeral,
        // id: id ? id : null,
        expire_at: expireAt,
      }),
    })
  ).json();

  if (ephemeral) {
    await navigator.clipboard.writeText(window.location.href + data.id);
    alert("Link copied to clipboard. This link can only be used once.");
  } else {
    window.location.pathname += data.id;
  }
  document.getElementById("save-button").classList.remove("w3-disabled");
}

function fileToContent(file) {
  if (!file || !file.type.startsWith("text/")) {
    return;
  }
  document.getElementById("option-filename").value = file.name;
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
  hiddenInput.style.height =
    highlightedInput.style.height =
    document.getElementById("content").style.height =
      hiddenInput.scrollHeight.toString() + "px";
  // Extra newline as a workaround for trailing newline not showing in code element.
  highlightedInput.firstChild.textContent = hiddenInput.value + "\n";
  highlightedInput.firstChild.classList.remove(...highlightedInput.firstChild.classList);
  if (hljs.listLanguages().includes(languageSelect.value)) {
    highlightedInput.firstChild.classList.add("hljs");
    highlightedInput.firstChild.classList.add(`language-${languageSelect.value}`);
  }
  hljs.highlightElement(highlightedInput.firstChild);
  syncScroll();
}

function handleTab(event) {
  if (event.key == "Tab") {
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
    document.getElementById("option-filename").value = documentData.filename;
    localStorage.removeItem("document-data");
  }
  hiddenInput.selectionEnd = 0;
  updateInput();

  const languages = ["[auto]", ...hljs.listLanguages()];
  for (const language of languages) {
    const option = document.createElement("option");
    option.value = language !== "[auto]" ? language : "";
    option.innerText = language;
    languageSelect.appendChild(option);
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
const languageSelect = document.getElementById("option-hl-lang");

hiddenInput.addEventListener("input", updateInput);
hiddenInput.addEventListener("scroll", syncScroll);
hiddenInput.addEventListener("keydown", handleTab);

window.addEventListener("keydown", handleShortcuts);
window.addEventListener("load", load);
