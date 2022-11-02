async function toggleElement(id) {
  document.getElementById(id).classList.toggle("w3-show");
}

async function highlight() {
  // TODO: Add language override using extension suffix in URL
  // or langauge in highlighting_language property
  hljs.highlightAll();  
}

window.addEventListener("load", highlight);
