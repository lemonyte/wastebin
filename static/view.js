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

window.addEventListener("keydown", (event) => {
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
});

const id = window.location.pathname.split("/").slice(1).join("/");
const rawURL = `${window.location.origin}/raw/${id}`;

let documentData;
fetch(`/api/get/${id}`)
  .then((response) => response.json())
  .then((data) => {
    documentData = data;
  });

const extension = window.location.pathname.split(".").slice(-1)[0];
if (!extension.includes("/")) {
  document.getElementsByTagName("code")[0].classList.add("hljs", `language-${extension}`);
}
