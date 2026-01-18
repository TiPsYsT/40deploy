import { getModels } from "./state.js";

export function renderSidebar() {
  const sidebar = document.getElementById("sidebar");
  sidebar.innerHTML = "";

  const groups = {};

  getModels().forEach(m => {
    if (!groups[m.name]) groups[m.name] = [];
    groups[m.name].push(m);
  });

  Object.entries(groups).forEach(([name, models]) => {
    const remaining = models.filter(
      m => m.x === null && m.base !== null
    ).length;

    if (remaining === 0) return;

    const header = document.createElement("div");
    header.style.fontWeight = "bold";
    header.style.marginTop = "8px";
    header.textContent =
      remaining > 1
        ? `${cap(name)} (${remaining})`
        : cap(name);

    sidebar.appendChild(header);

    const proxy = document.createElement("div");
    proxy.className = "unit";
    proxy.textContent = cap(name);
    proxy.draggable = true;

    proxy.ondragstart = e => {
      e.dataTransfer.setData("text/plain", name);
    };

    sidebar.appendChild(proxy);
  });
}

function cap(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
