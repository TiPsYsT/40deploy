import { getModels } from "./state.js";

export function renderSidebar(onDragSpawn) {
  const sidebar = document.getElementById("sidebar");
  sidebar.innerHTML = "";

  // group by unit name
  const groups = {};
  getModels().forEach(m => {
    if (!groups[m.name]) groups[m.name] = [];
    groups[m.name].push(m);
  });

  Object.entries(groups).forEach(([name, models]) => {
    const remaining = models.filter(m => m.x === null).length;

    // unit header
    const header = document.createElement("div");
    header.style.fontWeight = "bold";
    header.style.marginTop = "8px";
    header.textContent =
      remaining > 1 ? `${capitalize(name)} (${remaining})` : capitalize(name);

    sidebar.appendChild(header);

    // drag proxy (always one)
    const proxy = document.createElement("div");
    proxy.className = "unit";
    proxy.textContent = capitalize(name);
    proxy.draggable = true;

    proxy.ondragstart = e => {
      e.dataTransfer.setData("text/plain", name);
    };

    sidebar.appendChild(proxy);
  });
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
