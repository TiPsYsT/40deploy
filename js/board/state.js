export const boardState = {
  mission: null,
  terrain: null,
  dragging: false,
  dragOffsets: [],
  selecting: false,
  selectStart: null,
  rulerActive: false,
  rulerStart: null,
  rulerEnd: null
};

export function setMission(mission) {
  boardState.mission = mission;
}

export function setTerrain(terrain) {
  boardState.terrain = terrain;
}
