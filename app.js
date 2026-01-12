const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

const SCALE = 15; // px per inch
let models = [];
let selected = [];
let dragging = false;
let start = null;

function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // board
  ctx.strokeRect(0,0,60*SCALE,44*SCALE);

  models.forEach(m=>{
    ctx.beginPath();
    ctx.arc(m.x,m.y,m.r,0,Math.PI*2);
    ctx.fillStyle = selected.includes(m) ? "red" : "black";
    ctx.fill();
  });

  requestAnimationFrame(draw);
}

function spawn(type,count){
  for(let i=0;i<count;i++){
    models.push({
      type,
      r: type==="Neurolictor"?25:12,
      x:100+i*26,
      y:120
    });
  }
}

canvas.onmousedown = e=>{
  start = {x:e.offsetX,y:e.offsetY};
  selected = models.filter(m =>
    Math.hypot(m.x-e.offsetX,m.y-e.offsetY) < m.r
  );
  dragging = selected.length>0;
};

canvas.onmousemove = e=>{
  if(!dragging) return;
  let dx = e.offsetX-start.x;
  let dy = e.offsetY-start.y;
  selected.forEach(m=>{ m.x+=dx; m.y+=dy; });
  start = {x:e.offsetX,y:e.offsetY};
};

canvas.onmouseup = ()=> dragging=false;

draw();

