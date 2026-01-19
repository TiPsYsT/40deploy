let models = [];

const COLORS = [
  "#e6194b","#3cb44b","#ffe119","#4363d8",
  "#f58231","#911eb4","#46f0f0","#f032e6",
  "#bcf60c","#fabebe","#008080","#e6beff"
];

export function setModels(newModels) {
  let colorIndex = 0;
  const colorMap = new Map();

  newModels.forEach(m => {
    if (!colorMap.has(m.name)) {
      colorMap.set(m.name, COLORS[colorIndex++ % COLORS.length]);
    }
    m.color = colorMap.get(m.name);
  });

  models = newModels;
}

export function getModels() {
  return models;
}
