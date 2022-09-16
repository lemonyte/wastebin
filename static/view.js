async function share() {
  const data = {
    url: window.location.href,
    title: "Wastebin",
    text: document.getElementById("doc-filename").value,
  };
  if (window.navigator.canShare && window.navigator.canShare(data)) {
    await window.navigator.share(data);
  } else {
    await navigator.clipboard.writeText(window.location.href);
    alert("Link copied to clipboard.");
  }
}

async function copy() {
  const content = await (await fetch(rawURL)).text();
  await navigator.clipboard.writeText(content);
}

async function duplicate() {
  const docData = {
    url: rawURL,
    filename: document.getElementById("doc-filename").value,
  };
  localStorage.setItem("doc-data", JSON.stringify(docData));
  window.location.pathname = "/";
}

async function downloadText() {
  const filename = document.getElementById("doc-filename").value;
  const link = document.createElement("a");
  link.href = rawURL;
  link.download = filename || "paste.txt";
  link.click();
}

async function raw() {
  window.location = rawURL;
}

const id = window.location.pathname.split("/").pop();
const rawURL = window.location.origin + "/raw/" + id;
  window.location = "/raw/" + id;
    }
