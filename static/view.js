async function share() {
  const data = {
    url: window.location.href,
    title: "Wastebin",
    text: documentData.filename,
  };
  if (window.navigator.canShare && window.navigator.canShare(data)) {
    await window.navigator.share(data);
  } else {
    await navigator.clipboard.writeText(window.location.href);
    alert("Link copied to clipboard.");
  }
}

async function copy() {
  await navigator.clipboard.writeText(documentData.content);
}

function duplicate() {
  localStorage.setItem("document-data", JSON.stringify(documentData));
  window.location.pathname = "/";
}

function downloadText() {
  const link = document.createElement("a");
  link.href = rawURL;
  link.download = documentData.filename || "paste.txt";
  link.click();
}

function raw() {
  window.location = rawURL;
}

function handleShortcuts(event) {
  if (event.ctrlKey) {
    switch (event.key) {
      case "d":
        event.preventDefault();
        duplicate();
        break;
      case "s":
        event.preventDefault();
        downloadText();
        break;
    }
  }
}

async function load() {
  const response = await fetch(`/api/get/${id}`);
  if (!response.ok) {
    switch (response.status) {
      case 404:
        document.write(await response.text());
        break;

      default:
        alert("An unexpected error occurred. Please try again or report a bug with logs.");
        break;
    }
    return;
  }
  documentData = await response.json();
  if (documentData.filename) {
    document.title = `${documentData.filename} - ${document.title}`;
  }
  codeElement.textContent = documentData.content;
  if (!extension.includes("/")) {
    codeElement.classList.add("hljs", `language-${extension}`);
  } else if (documentData.highlighting_language) {
    codeElement.classList.add("hljs", `language-${documentData.highlighting_language}`);
  }
  hljs.highlightAll();
}

const id = window.location.pathname.replace("/doc/", "");
const extension = window.location.pathname.split(".").slice(-1)[0];
const rawURL = `${window.location.origin}/raw/${id}`;
const codeElement = document.getElementsByTagName("code")[0];
let documentData;

window.addEventListener("keydown", handleShortcuts);
window.addEventListener("load", load);
