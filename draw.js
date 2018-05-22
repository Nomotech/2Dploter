function drawCircle(cx,cy,r,stroke,fill,radStart,radEnd,ctx) {
    // console.log("cx:"+cx);
    // console.log("cy:"+cy);
    // console.log("r:"+r);
    // console.log("stroke:"+stroke);
    // console.log("fill:"+fill);
    // console.log("radStart:"+radStart);
    // console.log("radEnd:"+radEnd);
    // console.log("ctx:"+ctx);
    if (stroke == null) stroke="rgba(0,0,0,1)";
    if (fill == null) fill="rgba(0,0,0,0)";
    if (radStart == null) radStart=0;
    if (radEnd == null) radEnd=Math.PI*2;
    if (ctx == null) ctx=canvas.getContext('2d');


    ctx.beginPath();
    ctx.fillStyle = fill;
    ctx.strokeStyle = stroke;
    ctx.arc(cx, cy,r,radStart,radEnd,false);
    ctx.stroke();
    ctx.fill();
}

function drawLine(p1, p2, stroke, ctx) {
    if (stroke == null) stroke="rgba(0,0,0,1)";
    if (ctx == null) ctx=canvas.getContext('2d');
    ctx.strokeStyle = stroke;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
}


function hsvToRgb(H,S,V) {
    // H ... 0 ~ 360째
    // S ... 0 ~ 100%
    // V ... 0 ~ 100%
    let C = V * S;
    let Hp = H / 60;
    let X = C * (1 - Math.abs(Hp % 2 - 1));

    let R, G, B;
    if (0 <= Hp && Hp < 1) {[R,G,B]=[C,X,0]};
    if (1 <= Hp && Hp < 2) {[R,G,B]=[X,C,0]};
    if (2 <= Hp && Hp < 3) {[R,G,B]=[0,C,X]};
    if (3 <= Hp && Hp < 4) {[R,G,B]=[0,X,C]};
    if (4 <= Hp && Hp < 5) {[R,G,B]=[X,0,C]};
    if (5 <= Hp && Hp < 6) {[R,G,B]=[C,0,X]};

    let m = V - C;
    [R, G, B] = [R+m, G+m, B+m];

    R = Math.floor(R * 255);
    G = Math.floor(G * 255);
    B = Math.floor(B * 255);

    let rgb = {r:R,g:G,b:B};

    return rgb;
}