async function share() {
  try {
    const data = {
      url: window.location.href,
      title: "Wastebin",
      text: document.getElementById("doc-filename").value,
    };
    if (!window.navigator.canShare) {
      throw new Error("Browser does not support sharing");
    }
    if (!window.navigator.canShare(data)) {
      throw new Error("Browser cannot share data");
    }
    await window.navigator.share(data);
  } catch (error) {
    await navigator.clipboard.writeText(window.location.href);
    alert("Link copied to clipboard.");
  }
}

async function copy() {
  const content = document.getElementById("doc-content").value;
  await navigator.clipboard.writeText(content);
}

async function duplicate() {
  const docData = {
    content: document.getElementById("doc-content").value,
    filename: document.getElementById("doc-filename").value,
  };
  localStorage.setItem("doc-data", JSON.stringify(docData));
  window.location.pathname = "/";
}

async function downloadText() {
  const content = document.getElementById("doc-content").value;
  const filename = document.getElementById("doc-filename").value;
  const blob = new Blob([content], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.download = filename || "paste.txt";
  link.click();
}

async function raw() {
  const id = window.location.pathname.split("/").pop();
  window.location = "/raw/" + id;
}
