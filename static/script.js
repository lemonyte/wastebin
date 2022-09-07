function save() {
    const content = document.getElementById("doc-content").value.trim();
    if (!content) {
        return;
    }
    document.getElementById("save-button").classList.add("w3-disabled");
    // const id = document.getElementById("doc-id").value.trim();
    // const expireIn = document.getElementById("doc-expire-in").value.trim();
    fetch("/api/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            content: content,
            filename: document.getElementById("doc-filename").value.trim(),
            // id: id ? id : null,
            // expireIn: expireIn ? expireIn : null,
        })
    })
        .then((response) => { return response.json(); })
        .then((data) => { window.location += data.id; });
}

function copy() {
    const content = document.getElementById("doc-content").value;
    navigator.clipboard.writeText(content);
}

function duplicate() {
    const docData = {
        content: document.getElementById("doc-content").value,
        filename: document.getElementById("doc-filename").value,
    }
    localStorage.setItem("doc-data", JSON.stringify(docData));
    window.location.pathname = "/";
}

function downloadText() {
    const content = document.getElementById("doc-content").value;
    const filename = document.getElementById("doc-filename").value;
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = filename || "paste.txt";
    link.click();
}

function load() {
    const content = document.getElementById("doc-content");
    const docDataJson = localStorage.getItem("doc-data");
    if (docDataJson) {
        const docData = JSON.parse(docDataJson);
        content.value = docData.content;
        content.style.height = content.scrollHeight.toString() + "px";
        localStorage.removeItem("doc-data");
    }
    content.selectionEnd = 0;
}
