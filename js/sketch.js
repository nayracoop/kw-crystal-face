p5.disableFriendlyErrors = true; 

var sketch;
var dataURL = "new_color.json";
var depth = 1.5;
var imageWidth = 720;
var imageHeight; // auto
var plainMode = false;

axios.get(dataURL).then(function(response) {
  var data = response.data;
  imageHeight = (data.width) ? imageWidth / data.width * data.height : imageWidth;
  for(var i = 0; i < data.triangles.length; i++) {
    for(var j = 0; j < data.triangles[i].points.length; j++) {
      data.triangles[i].points[j].x /= (data.width) ? data.width : 1;
      data.triangles[i].points[j].x *= imageWidth;
      data.triangles[i].points[j].x -= imageWidth/2;
      data.triangles[i].points[j].y /= (data.height) ? data.height : 1;
      data.triangles[i].points[j].y *= imageHeight;
      data.triangles[i].points[j].y -= imageHeight/2;
      data.triangles[i].points[j].z *= depth;
    }
  }
  sketch = new p5(createSketch(data));
}).catch(function (error) {});

function createSketch(data) {
  
  return function (p5) {
    
    var fragments = []
    
    p5.setup = function() {
      p5.createCanvas(p5.windowWidth, p5.windowHeight, p5.WEBGL);
      p5.background(0);
      p5.noStroke();
      for(var i = 0; i < data.triangles.length; i++)  fragments.push(new Fragment(data.triangles[i].points, data.triangles[i].color));
      //p5.colorMode(p5.HSB, 360, 100, 100);
    }
    
    p5.draw = function() { 
      p5.background(0);
      if(!plainMode) illuminate();
      p5.rotateY(p5.map(p5.mouseX, 0, p5.width, -p5.radians(5), p5.radians(5)));
      p5.rotateX(p5.map(p5.mouseY, 0, p5.height, p5.radians(5), -p5.radians(5)));

      for(var i = 0; i < fragments.length; i++) {
        fragments[i].draw();
        fragments[i].move();
      }
    }

    function illuminate() {
      p5.ambientLight(255);
      p5.pointLight(30+p5.sin(p5.radians(p5.millis()/30))*50,30,5,-80,-20,300);
      // pointLight(20,100,200,480,-220,300);
      p5.pointLight(30,5,30+p5.sin(p5.radians(p5.millis()/20))*50,80,80,300);
    }

    class Fragment {

      constructor(points, color) {
        this.points = this.sanitizePoints(points);
        this.color = p5.color('#' + color);

        this.position = { x: 0, y: 0, z: 0 };
        this.velocity = { x: 0, y: 0, z: 0 };
        this.initialPosition = { x: 0, y: 0, z: 0 };
        this.rotation = 0;
        this.scale = 1;
        
        this.specular = (p5.brightness(this.color) < 18) ? false : true;
        this.calculateCenter();

        // this.velocity.z = p5.map(this.position.x, -imageWidth/2, imageWidth/2, 0.1, 5);
      }

      sanitizePoints = function(points) {
        if(points.length == 0) return null;

        var count = 0;
        var cleanedPoints = [];
        for(var i = 0; i < points.length && count < 3; i++) {
          if(points[i]) {
            var repeated = false;
            for(var j = 0; j < i; j++) repeated = repeated || (points[i].x === points[j].x && points[i].y === points[j].y && points[i].z === points[j].z);
            if(!repeated) {
              cleanedPoints.push({ x: points[i].x, y: points[i].y, z: points[i].z });
              count++;
            }
          }
        }
        return (cleanedPoints.length == 3) ? cleanedPoints : null;
      }
      
      calculateCenter = () => {

        if(!this.points) return;
        
        var x = 0, y = 0, z = 0;
        for(var i = 0; i < this.points.length; i++) {
          x += this.points[i].x;
          y += this.points[i].y;
          z += this.points[i].z;
        }

        x /= this.points.length;
        y /= this.points.length;
        z /= this.points.length;

        this.position = { x, y, z };
        this.initialPosition = { x, y, z };

        for(var i = 0; i < this.points.length; i++) {
          this.points[i].x = this.points[i].x - this.position.x;
          this.points[i].y = this.points[i].y - this.position.y;
          this.points[i].z = this.points[i].z - this.position.z;
        }
      }

      draw = function() {
        p5.push();
        if(plainMode) {
          p5.translate(this.position.x, this.position.y);
          p5.fill(this.color);
          p5.triangle(this.points[0].x, this.points[0].y, this.points[1].x, this.points[1].y, this.points[2].x, this.points[2].y);
        } else {
          p5.translate(this.position.x, this.position.y, this.position.z);
          if(this.specular) {
            p5.specularMaterial(this.color);
            p5.shininess(10);
          }
          else p5.emissiveMaterial(this.color);
          p5.beginShape();
          for(var i = 0; i < this.points.length; i++) {
            p5.vertex(this.points[i].x, this.points[i].y, this.points[i].z);
          }
          p5.endShape();
        }
        p5.pop();
      }

      move = function() {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        this.position.z += this.velocity.z;

        // this.position.x += (this.initialPosition.x - this.position.x) * 0.05;
        // this.position.y += (this.initialPosition.y - this.position.y) * 0.05;
        // this.position.z += (this.initialPosition.z - this.position.z) * 0.05;

        // this.velocity.x *= 0.93;
        // this.velocity.y *= 0.94;
        // this.velocity.z *= 0.96;
      }
      
    }

  }
}