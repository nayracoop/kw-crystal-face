var dataLoaded = false;
var data;

axios.get("colorfull.json").then(function(response) {
  data = response.data;
  clean();
  dataLoaded = true;
  console.log(data)
}).catch(function (error) {
	console.log(error);
});

var n = 100;     // número de circulos
var circulos = [];
var lines;
var colors = [ [ 0x0d, 0x00, 0x52 ], [ 0x49, 0x09, 0x8b ], [ 0x3f, 0x9e, 0xd1 ], [ 0x02, 0x77, 0x08 ], [ 0xfe, 0xd1, 0x01 ], [ 0xfe, 0x76, 0x0f ], [ 0xbf, 0x00, 0x00 ] ];

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  background(0);
  noStroke();
  noCursor();
}

function draw() {
  ambientLight(255);
  //pointLight(255,0,0,0,0,-mouseY);
  
  if(dataLoaded) {
    background(0);
    //translate(width/2, height/2);
    //if(mousePressed) translate(0,0,map(mouseX, 0, width, 0, -200));
    pointLight(100,100,255,-300,0,500);
    pointLight(255,100,255,0,0,500);
    pointLight(100,255,100,0,-300,500);
    pointLight(100,255,100,300,0,500);
    pointLight(100,255,255,0,300,500);
    pointLight(255,100,100,-200,0,-160);
    // pointLight(0,0,255,mouseY+300-height/2,0,-160);
    // pointLight(0,100,255,0,mouseX-200,0);
    // directionalLight(255, 255, 255, -1, 0, 0)
    triangle(0,-5, 5, 5, -5, 5);
    rotateY(map(mouseX, 0, width, -radians(5), radians(5)));
    rotateX(map(mouseY, 0, height, radians(3), -radians(3)));
    scale(0.5);
    translate(data.width/-2, data.height/-2);
    for(var i = 0; i < data.triangles.length; i++) {
      
      if(data.triangles[i] ) {
        //fill("#" + data.triangles[i].color);
        push();
        //translate(0,0,map(mouseY, 0, height, 0, green(color("#" + data.triangles[i].color))*2));
        //cube(0,0,0,20,20,20);
        // triangle( data.triangles[i].points[0].x, data.triangles[i].points[0].y,
        //           data.triangles[i].points[1].x, data.triangles[i].points[1].y,
        //           data.triangles[i].points[2].x, data.triangles[i].points[2].y);
        beginShape();
        specularMaterial('#' + data.triangles[i].color);
        // console.log(data.triangles[i].points)
        let counter = 0;
          for(let j = 0; j < data.triangles[i].points.length && counter < 3; j++) {
            if(data.triangles[i].points[j]) {
              let pointRepeated = false;
              for(let k = 0; k < j; k++) {
                pointRepeated = pointRepeated || (data.triangles[i].points[j].x === data.triangles[i].points[k].x && data.triangles[i].points[j].y === data.triangles[i].points[k].y && data.triangles[i].points[j].z === data.triangles[i].points[k].z);
              }
              if(!pointRepeated) {
                vertex(data.triangles[i].points[j].x, data.triangles[i].points[j].y, data.triangles[i].points[j].z*2);
                counter++;
              }
            }
          }
          endShape();
        pop();
      }
    }
  }
}

function clean () {

  // for(var i = 0; i < data.triangles.length; i++) {
    
  //   var x = (data.triangles[i].points[0].x + data.triangles[i].points[1].x + data.triangles[i].points[2].x) / 3;
  //   var y = (data.triangles[i].points[0].y + data.triangles[i].points[1].y + data.triangles[i].points[2].y) / 3;

  //   data.triangles[i].visible = (dist(x, y, data.width/2, data.height/2) < 150);
  // }

}