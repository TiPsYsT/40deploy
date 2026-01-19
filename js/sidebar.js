import { getModels } from "./state.js";

export function renderSidebar() {
  const sidebar = document.getElementById("sidebar");
  const help = sidebar.querySelector(".help");
  sidebar.innerHTML = "";
  if (help) sidebar.appendChild(help);

  const groups = {};
  getModels().forEach(m => {
    if (!groups[m.name]) groups[m.name] = [];
    groups[m.name].push(m);
  });

  Object.entries(groups).forEach(([name, models]) => {
    const remaining = models.filter(m => m.x === null && m.base !== null).length;
    if (!remaining) return;

    const header = document.createElement("div");
    header.style.fontWeight = "bold";
    header.textContent = `${cap(name)} (${remaining})`;
    sidebar.appendChild(header);

    const proxy = document.createElement("div");
    proxy.className = "unit";
    proxy.draggable = true;

    const dot = document.createElement("div");
    dot.className = "color-dot";
    dot.style.background = models[0].color;

    proxy.appendChild(dot);
    proxy.appendChild(document.createTextNode(cap(name)));

    proxy.ondragstart = e =>
      e.dataTransfer.setData("text/plain", name);

    sidebar.appendChild(proxy);
  });
}

function cap(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
