function save() {
    const content = document.getElementById("doc-content").value.trim();
    if (!content) {
        return;
    }
    document.getElementById("save-button").classList.add("w3-disabled");
    // const id = document.getElementById("id").value.trim();
    // const expireIn = document.getElementById("expire-in").value.trim();
    fetch("/api/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            content: content,
            filename: document.getElementById("filename").value.trim(),
            // id: id ? id : null,
            // expireIn: expireIn ? expireIn : null,
        })
    })
        .then((response) => { return response.json(); })
        .then((data) => { window.location += data.id; });
}

function duplicate() {
    const docData = {
        content: document.getElementById("doc-content").value,
        filename: document.getElementById("filename").value,
    }
    localStorage.setItem("doc-data", JSON.stringify(docData));
    window.location.pathname = "/";
}

const contentElement = document.getElementById("doc-content");
const docDataJson = localStorage.getItem("doc-data");
if (docDataJson) {
    const docData = JSON.parse(docDataJson);
    contentElement.value = docData.content;
    contentElement.style.height = contentElement.scrollHeight.toString() + "px";
    localStorage.removeItem("doc-data");
}
contentElement.selectionEnd = 0;
