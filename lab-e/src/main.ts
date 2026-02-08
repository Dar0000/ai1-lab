// список dostępnych styli
const styles: Record<string, string> = {
  "Style 1": "/style-1.css",
  "Style 2": "/style-2.css",
  "Style 3": "/style-3.css"
};

// generuje linki na stronie
function generateLinks() {
  const container = document.getElementById("style-links");
  if (!container) return;

  container.innerHTML = "";

  for (const name in styles) {
    const a = document.createElement("a");
    a.textContent = name;
    a.href = "#";
    a.style.marginRight = "10px";

    a.onclick = (e) => {
      e.preventDefault();
      applyStyle(name);
    };

    container.appendChild(a);
  }
}

// zmiana stylu
function applyStyle(styleName: string) {
  // usuń stary styl
  const existing = document.getElementById("dynamic-style");
  if (existing) existing.remove();

  // dodaj nowy styl
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.id = "dynamic-style";
  link.href = styles[styleName];

  document.head.appendChild(link);
}

// uruchomienie wszystkiego
generateLinks();
applyStyle("Style 1");  // domyślny
