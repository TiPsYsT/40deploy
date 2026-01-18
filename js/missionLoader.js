export async function loadMission(id) {
  const res = await fetch(`missions/${id}.json`);
  return res.json();
}
