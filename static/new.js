async function save() {
  const content = document.getElementById("doc-content").value.trim();
  if (!content) {
    return;
  }
  document.getElementById("save-button").classList.add("w3-disabled");
  // const id = document.getElementById("doc-id").value.trim();
  // const expireIn = document.getElementById("doc-expire-in").value.trim();
  const response = await fetch("/api/new", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content: content,
      filename: document.getElementById("doc-filename").value.trim(),
      // id: id ? id : null,
      // expireIn: expireIn ? expireIn : null,
    }),
  });
  const data = await response.json();
  window.location.pathname += data.id;
}

async function load() {
  const content = document.getElementById("doc-content");
  const docDataJson = localStorage.getItem("doc-data");
  if (docDataJson) {
    const docData = JSON.parse(docDataJson);
    content.value = await (await fetch(docData.url)).text();
    content.style.height = content.scrollHeight.toString() + "px";
    document.getElementById("doc-filename").value = docData.filename;
    localStorage.removeItem("doc-data");
  }
  content.selectionEnd = 0;
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

window.addEventListener("load", load);
