
var dataLoaded = false;
var data;

axios.get("low_polygons.json").then(function(response) {
  data = response.data;
  clean();
  dataLoaded = true;
  console.log(data)
}).catch(function (error) {
	console.log(error);
});

var n = 100;     // nÃºmero de circulos
var circulos = [];
var lines;
var colors = [ [ 0x0d, 0x00, 0x52 ], [ 0x49, 0x09, 0x8b ], [ 0x3f, 0x9e, 0xd1 ], [ 0x02, 0x77, 0x08 ], [ 0xfe, 0xd1, 0x01 ], [ 0xfe, 0x76, 0x0f ], [ 0xbf, 0x00, 0x00 ] ];

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  background(0);
  noStroke();
}

function draw() {
    
  if(dataLoaded) {
    background(0);
    //translate(width/2, height/2);
    //if(mousePressed) translate(0,0,map(mouseX, 0, width, 0, -200));
    //rotateY(map(mouseX, 0, width, -radians(25), radians(25)));
    //rotateX(map(mouseY, 0, width, radians(25), -radians(25)));
    scale(1.15);
    //translate(data.width/2, data.height/2);
    for(var i = 0; i < data.triangles.length; i++) {
      if(data.triangles[i].visible) {
        fill("#" + data.triangles[i].color);
        push();
          translate(
            map(mouseX, 0, width, -200, green(color("#" + data.triangles[i].color))*10),
            0,
            map(mouseX, 0, width, 0, green(color("#" + data.triangles[i].color))*8)
          );
          triangle( data.triangles[i].points[0].x,
                    data.triangles[i].points[0].y,
                    data.triangles[i].points[1].x,
                    data.triangles[i].points[1].y,
                    data.triangles[i].points[2].x,
                    data.triangles[i].points[2].y);
        pop();
      }
    }
  }
}

function clean () {

  for(var i = 0; i < data.triangles.length; i++) {
    
    var x = (data.triangles[i].points[0].x + data.triangles[i].points[1].x + data.triangles[i].points[2].x) / 3;
    var y = (data.triangles[i].points[0].y + data.triangles[i].points[1].y + data.triangles[i].points[2].y) / 3;

    data.triangles[i].visible = true; // (dist(x, y, data.width/2, data.height/2) < 150);
  }

}