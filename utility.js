let mouseX = 50;
let mouseY = 50;
let mouseR = false;
let mouseC = false;
let mouseL = false;
let oldmouseR = false;
let oldmouseC = false;
let oldmouseL = false;
//var mouseButton = new InputMouseButton(window);

document.onmousemove = function(e) {
    let rect = e.target.getBoundingClientRect();
    // マウス位置(2D)
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
    //console.log("X: " + mouseX + " Y: " + mouseY);
};

document.onmousedown = function(e) {
    //console.log("button: " + e.button + " buttons: " + e.buttons);
    mouseL = (e.button == 0) ? true : false;
    mouseC = (e.button == 1) ? true : false; 
    mouseR = (e.button == 2) ? true : false;
};

document.onmouseup = function (e){
    mouseL = false;
    mouseC = false; 
    mouseR = false;
};

function csv2Array(filePath) { //csvﾌｧｲﾙﾉ相対ﾊﾟｽor絶対ﾊﾟｽ
  let csvData = new Array();
  let lines = filePath.split("\n");
  
  for (let i = 0; i < lines.length;++i) {
    let str = lines[i].replace(/\r/g,'');
    let cells = str.split(",");
    if( cells.length == 3 ) {
      csvData.push( Number(cells[2]) );
    }
  }
  return csvData;
}
