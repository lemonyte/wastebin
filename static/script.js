function save() {
    const content = document.getElementById("content").value;
    if (!content) {
        return;
    }
    fetch("/api/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content })
    })
        .then((response) => { return response.json(); })
        .then((data) => { window.location += data.key; });
}

function duplicate() {
    localStorage.setItem("content", document.getElementById("content").value);
    window.location.pathname = "/";
}

const content = localStorage.getItem("content");
if (content) {
    const element = document.getElementById("content");
    element.value = content;
    element.style.height = element.scrollHeight.toString() + "px";
    localStorage.removeItem("content");
}