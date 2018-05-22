let canvas  = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
const width = 1200;

let row = [];
let objects = [];
let start = 1;    // plot 初めの点
let end = 2;
const off = 500;      // 縦のoffset
let step = 0.5;     // 横のstep
let coef = 500;     // 縦の倍率



$("#start").val(start);
$("#end").val(end);
$("#step").val(step)
$("#coef").val(coef)


$("#file").change(function(e){
  let file = e.target.files[0];
  // FileReader.onloadイベントに
  // ファイル選択時に行いたい処理を書く
  let reader = new FileReader();
  reader.onload = function(e){
      // 選択したCSVファイルから2次元配列を生成
      row = csv2Array(e.target.result);
      //console.log(row)
      console.log(row.length)
      $("#end").val(row.length)
      end = row.length;
      $("#step").val(width / row.length)
      ana(row)
  };
  // Textとしてファイルを読み込む
  reader.readAsText(file);

});

$("#start").change((e) => {
  start = Number($("#start").val());
  if(start < 1) {
    console.log(start)
    start = 1;
    $("#start").val(1);
  }
  if(end <= start) {
    console.log(start)
    $("#end").val(start + 1);
  }
  ana(row);
  draw();
})

$("#end").change((e) => {
  end = Number($("#end").val());
  if(end > row.length) {
    end = row.length;
    $("#end").val(end);
  }
  if(end <= start) {
    console.log(start)
    $("#start").val(end);
  }
  ana(row);
  draw();
})

$("#step").change((e) => {
  step = Number($("#step").val());
  if(step < 0.0) {
    step = 0.0;
    $("#step").val(step);
  }
  ana(row);
  draw();
})


$("#coef").change((e) => {
  coef = Number($("#coef").val());
  if(coef < 0) {
    coef = 0;
    $("#coef").val(coef);
  }
  ana(row);
  draw();
})

function plot(arr, c) {
  objects.push(function(){ drawLine({x: 0, y: off}, {x: width, y: off}, `rgba(0,0,0,0.8)`)});
  for (let i = start; i < end; i++) {
    let po = 0.5;
    let color = hsvToRgb(0 + c, 1,1);
    objects.push(function(){ 
      drawCircle((i - start) * step, off + arr[i] * coef,
      1, 
      `rgba(${color.r},${color.g},${color.b},0.8)`,
      `rgba(${color.r},${color.g},${color.b},0.1)`
      )
    });
    objects.push(function(){ drawLine({x: (i - start - 1) * step, y: off + arr[i - 1] * coef}, {x: (i - start) * step, y: off + arr[i] * coef}, `rgba(${color.r},${color.g},${color.b},0.8)`)});
  }
}

function ana(row) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  let sum = 0;
  let num = (end - start == 0) ? 1 : end - start;
  let color = hsvToRgb(0  , 1,1);
  for (let i = start; i < end; i++) sum += row[i];
  sum /= num;

  for (let a of row) a -= sum;
  plot(row,0);
  draw();

  let arr = jQuery.extend(true, [], row);
  //po(arr, 2)
  arr = spline(arr);
  plot(arr, 120)
  

  arr = jQuery.extend(true, [], row);
  // // 平滑化
  // po(arr, 3)
  // arr = smoothing(arr, 5);
  // //po(arr, 10)
  // //arr = spline(arr);
  let data = [];
  let arr_s = selection(arr);
  let data_num = 31;
  let offset = 15;
  let arr_num = data_num - offset * 2;
  // let data_start = arr_s.length - data_num - 330;
  // for (let i = data_start; i < data_start + data_num; i++) data.push(arr_s[i])
  // arr = sai(data)
  arr = new Array(arr.length).fill(0);
  for (let data_start = 0; (data_start + data_num) < arr_s.length; data_start += arr_num) {
    let data = [];
    for (let i = data_start; (i < data_start + data_num && i < arr_s.length); i++) data.push(arr_s[i]);
    sai_arr = sai(data);
    for (let i = data[offset - 1].x; i < data[data.length - offset].x; i++) {
      arr[i] = sai_arr[i]
    }
  } 
  
  // arr = smoothing(arr, 3);
  // arr = smoothing(arr, 3);
  // arr = smoothing(arr, 3);
  plot(arr, 240)
  draw();


  // 交点
  let crossPoints = [];
  for (let i = start; i < end; i++) {
    let p = arr[i-1];
    let q = arr[i];
    if(p * q < 0) {
      let cp = { x : (i - 1 - start) - p / (q - p), y : 0 };
      crossPoints.push(cp);
    }
  }
  while ((crossPoints.length - 1) % 2 != 0 && crossPoints.length > 1) crossPoints.pop() ;
  for(let cp of crossPoints) objects.push(function(){ drawCircle( cp.x * step, off, 5, `rgba(${color.r},${color.g},${color.b},0.8)`, `rgba(${color.r},${color.g},${color.b},0.1)`)});

  let k = 0;
  sum = 0;
  if(crossPoints.length > 1) {
    let a = crossPoints.length;
    for(let i = 1; i < a; i++) sum += crossPoints[i] - crossPoints[i-1];
    k = sum / (a - 1);
  
    for (let i = start; i < end; i++) {
      let i_ = i - start;
      objects.push(function(){ drawLine(
        {x: (i_ - 1) * step, y: off + 100 * Math.sin((i - 1 - crossPoints[0].x) * Math.PI / k)}, 
        {x: (i_    ) * step, y: off + 100 * Math.sin((i -     crossPoints[0].x) * Math.PI / k)}, 
        `rgba(${color.r},${color.g},${color.b},0.8)`)
      });
    }
  }
  
  draw();
}


// #define n 4/*n-1次の多項式で近似する*/
// #define N 4/*ガウスの消去法*/
// #define S 5/*データの個数*/


let sai = (data) => {
  let n = 5;
  let S = data.length;
  let A = new Array(n).fill(0);
  for (let i = 0; i < n; i++) A[i] = new Array(n + 1).fill(0);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      for (let k = 0; k < S; k++) {
        A[i][j] += Math.pow(data[k].x, i+j);
      }
    }
  }
  for(let i = 0; i < n; i++) {
    for(let k = 0; k < S; k++) {
      A[i][n] += Math.pow(data[k].x,i) * data[k].y;
    }
  }
  let a = gauss(A);
  let arr = [];
  for(let i = 0; i < row.length; i++) {
    let b = 0;
    for (let j = a.length - 1; j >= 0; j--) b = a[j] + i * b;
    arr.push(b)
  }
  return arr;
}

let gauss = (a) => {
  let N = a.length;
  let x = new Array(N).fill(0);
  let b = new Array(N + 1).fill(0);

  for(let i = 0; i < N; i++) {
    let m = 0;
    let pivot = i;

    for(let l = i; l < N; l++) {
      if(Math.abs(a[l][i]) > m) {   //i列の中で一番値が大きい行を選ぶ
        m = Math.abs(a[l][i]);
        pivot = l;
      }
    }

    if(pivot != i) {                          //pivotがiと違えば、行の入れ替え
      for(let j = 0; j < N+1; j++) {
        b[j] = a[i][j];        
        a[i][j] = a[pivot][j];
        a[pivot][j] = b[j];
      }
    }
  }

  for(let k = 0; k < N; k++) {
    let p = a[k][k];              //対角要素を保存
    a[k][k] = 1;              //対角要素は１になることがわかっているから

    for(let j = k+1; j < N+1; j++) {
      a[k][j]/=p;
    }

    for(let i = k+1; i < N; i++) {
      q=a[i][k];

      for(let j = k+1; j < N+1; j++) {
        a[i][j]-=q*a[k][j];
      }
    a[i][k]=0;              //０となることがわかっているところ
    }
  }

//解の計算
  for(let i = N-1; i >= 0; i--) {
    x[i] = a[i][N];
    for(let j = N-1; j > i; j--) {
      x[i] -= a[i][j]*x[j];
    }
  }
  return x;
}

// let gauss = (a) => {
//   /*前進消去*/
//   // printf("前進消去\n");
//   console.log(a)
//   let N = a.length;
//   for (let k = 0; k < N-1; k++) {   
//     let amax = Math.abs(a[k][k]);
//     let pivot=k;
//     for (let i = k+1; i < N; i++) {
//       let ai = Math.abs(a[i][k]);
//       if (ai > amax) {
//         amax=ai;
//         pivot=i;
//       }
//       for(let j = 0; j <= N; j++) {
//         ai = a[k][j];
//         a[k][j]=a[pivot][j];
//         a[pivot][j]=ai;
//       }
//     }
//     for(let i = k+1; i < N; i++) {
//       p = a[i][k]/a[k][k];
//       for(j=0;j<N+1;j++) a[i][j]=a[i][j]-p*a[k][j];
//     }
//   }

//   /*後退代入*/
//   a[N-1][N]=a[N-1][N]/a[N-1][N];
//   for (let i = N-2; i >= 0; i--) {
//     for(j=i+1;j<N;j++) a[i][N]=a[i][N]-a[i][j]*a[j][N];
//     a[i][N]=a[i][N]/a[i][i];
//   }

//   let ans = [];
//   for(let i = 0; i < N; i++) ans.push(a[i][N]);
//   console.log(a);
//   return ans;
// }

let selection = (arr) => {
  let data = [];
  let offset = 0;
  let flag = true;
  data.push({x:0, y:arr[0]});
  for(let i = 1; i < arr.length; i++) {
    if (arr[i] == arr[i-1]) {
      flag = false;
      offset++;
    } else {
      data.push({x:i, y:arr[i]});
      if (flag == false) {
        flag = true;
        offset = 0;
      }
    }
  }
  return data;
}

let aic = (m) => {
  let n ; // データ数
  let sig2;
  return n * (Math.log(2 * Math.PI) + 1 + Math.log(m)) + 4 + 2 * m;

}

let po = (arr, num) => {
  for (let i = num; i < arr.length; i++) {
    for (let j = 2; j < num; j++) {
      if (arr[i] == arr[i - j]) {
        for (let k = 1; k < j; k++) {
          arr[i - k] = arr[i];
        } 
      }
    }
  }
}



// numは奇数が望ましい
let smoothing = (arr, num) => {
  let a = [];
  let half = Math.floor(num/2);
  for(let i = 0; i < half; i++) a.push(arr[i]);

  
  for(let i = 0; i < arr.length - Math.ceil(num/2); i++) {
    let sum = 0;
    for(let j = 0 ; j < num; j++) sum += arr[i + j];
    a.push((sum / num + arr[i + half]) / 2)
  }
  for(let i = 0; i < half; i++) a.push(arr[arr.length - i - 1]);
  return a;
}

let spline = (arr) => {
  let h = [];
  let data = [];

  let offset = 0;
  let flag = true;
  data.push({x:0, y:arr[0]});
  for(let i = 1; i < arr.length; i++) {
    if (arr[i] == arr[i-1]) {
      flag = false;
      offset++;
    } else {
      data.push({x:i, y:arr[i]});
      h.push(offset + 1);
      if (flag == false) {
        flag = true;
        offset = 0;
      }
    }
  }

  let n = data.length - 1;
  //let h = new Array(n);
  let b = new Array(n);
  let d = new Array(n);
  let g = new Array(n);
  let u = new Array(n);
  let r = new Array(n+1);

  let calc = (x1) => {
    let i = -1;
    let k;
    let y1, qi, si, xx;
    // 区間の決定
    for (let j = 1; j < n && i < 0; j++) if (x1 < data[j].x) i = j - 1;
    if (i < 0) i = n - 1;
    
    // ステップ１
    //for (let j = 0; j < n; j++) h[j] = data[j+1].x - data[j].x;
    for (let j = 1; j < n; j++) {
      b[j] = 2.0 * (h[j] + h[j-1]);
      d[j] = 3.0 * ((data[j+1].y - data[j].y) / h[j] - (data[j].y - data[j-1].y) / h[j-1]);
    }
    
    // ステップ２
    g[1] = h[1] / b[1];
    for (let j = 2; j < n-1; j++) g[j] = h[j] / (b[j] - h[j-1] * g[j-1]);
    u[1] = d[1] / b[1];
    for (let j = 2; j < n; j++) u[j] = (d[j] - h[j-1] * u[j-1]) / (b[j] - h[j-1] * g[j-1]);
    
    // ステップ３
    k      = (i > 1) ? i : 1;
    r[0]   = 0.0;
    r[n]   = 0.0;
    r[n-1] = u[n-1];
    for (let j = n-2; j >= k; j--) r[j] = u[j] - g[j] * r[j+1];
    
    // ステップ４
    xx = x1 - data[i].x;
    qi = (data[i+1].y - data[i].y) / h[i] - h[i] * (r[i+1] + 2.0 * r[i]) / 3.0;
    si = (r[i+1] - r[i]) / (3.0 * h[i]);
    y1 = data[i].y + xx * (qi + xx * (r[i]  + si * xx));

    return y1;
  }

  let ans = [];
  for (let x = 0; x < arr.length; x++) ans.push(calc(x));
  //console.log(ans)
  return ans;
}



function draw(){
  //console.log(objects)
  for(let f of objects) f();
  objects = [];  
}



function update(){

}


// function render() {
//     ctx.clearRect(0, 0, canvas.width, canvas.height);
//     draw();
//     requestAnimationFrame(render);
// }render();

