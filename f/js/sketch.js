p5.disableFriendlyErrors = true; 

var sketch;
var dataURL = "final_color.json";
var depth = 1.5;
var imageWidth = (screen.width < 720) ? screen.width + 80 : 720;
var imageHeight; // auto
var plainMode = true;
var glitch = true;

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

    p5.disableFriendlyErrors = true; 
    
    var fragments = []
    
    p5.setup = function() {
      p5.setAttributes({
        antialias: true,
        // alpha: false,
      });
      p5.createCanvas(p5.windowWidth, p5.windowHeight, p5.WEBGL);
      p5.background(0);
      p5.noStroke();
      for(var i = 0; i < data.triangles.length; i++)  fragments.push(new Fragment(data.triangles[i].points, data.triangles[i].color));
      //p5.colorMode(p5.HSB, 360, 100, 100);
    }
    
    p5.draw = function() { 
      // p5.background(0);
      p5.clear();
      
      if(!plainMode) illuminate();
      // p5.rotateY(p5.map(p5.mouseX, 0, p5.width, -radians(5), radians(5)));
      // p5.rotateX(p5.map(p5.mouseY, 0, p5.height, radians(5), -radians(5)));
      
      var scrollY = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
      if(glitch/* && scrollY < 20*/) p5.rotateY(radians(Math.sin(p5.millis()*0.0001)/2));
      for(var i = 0; i < fragments.length; i++) {
        fragments[i].draw();
        fragments[i].move(scrollY);
      }

      // let fps = p5.frameRate();
      // console.log(fps)
    }

    p5.windowResized = function() {
      p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
    }

    function radians(deg) {
      return  deg * (Math.PI/180)
    }

    function illuminate() {
      p5.ambientLight(255);
      p5.pointLight(30+Math.sin(radians(p5.millis()/30))*50,30,5,-80,-20,300);
      // pointLight(20,100,200,480,-220,300);
      p5.pointLight(30,5,30+Math.sin(radians(p5.millis()/20))*50,80,80,300);
    }

    class Fragment {

      constructor(points, color) {
        this.points = this.sanitizePoints(points);
        this.color = p5.color('#' + color);

        this.position = { x: 0, y: 0, z: 0 };
        this.velocity = { x: 0, y: 0, z: 0 };
        this.initialPosition = { x: 0, y: 0, z: 0 };
        this.currentPosition = { x: 0, y: 0, z: 0 };
        this.finalPosition = { x: 0, y: 0, z: 0 };
        this.rotation = 0;
        this.scale = 0;
        this.area = 500;
        
        this.specular = (p5.brightness(this.color) < 18) ? false : true;
        this.calculateCenter();

        this.delay = p5.dist(this.initialPosition.x, this.initialPosition.y, 0, imageHeight/2) * 5 - 1000;
        this.time = -1;
        
        var angle = Math.atan2(this.initialPosition.y+140*0, this.initialPosition.x-20*0) + p5.random(radians(-65), radians(65));
        // var angle = Math.random()*(Math.PI*2);
        var spread = (screen.width < 720) ? screen.width * 0.4 : 300;
        var radius = Math.random()*spread + (p5.windowHeight/2);

        this.finalPosition.x = Math.cos(angle)*radius;
        this.finalPosition.y = Math.sin(angle)*radius;

        this.glitchTime = p5.millis();

        // this.velocity.z = p5.map(this.position.x, -imageWidth/2, imageWidth/2, 0.1, 5);
      }

      sanitizePoints(points) {
        if(points.length == 0) return null;

        var count = 0;
        var cleanedPoints = [];
        for(var i = 0; i < points.length && count < 20; i++) {
          if(points[i]) {
            var repeated = false;
            for(var j = 0; j < i; j++) repeated = repeated || (points[i].x === points[j].x && points[i].y === points[j].y && points[i].z === points[j].z);
            if(!repeated) {
              cleanedPoints.push({ x: points[i].x, y: points[i].y, z: points[i].z });
              count++;
            }
          }
        }
        return (cleanedPoints.length >= 3) ? cleanedPoints : null;
      }
      
      calculateCenter() {

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
        this.currentPosition = { x, y, z };

        for(var i = 0; i < this.points.length; i++) {
          this.points[i].x = this.points[i].x - this.position.x;
          this.points[i].y = this.points[i].y - this.position.y;
          this.points[i].z = this.points[i].z - this.position.z;
        }
        // if(this.points.length === 3) {
        //   this.area = 0.5 * (Math.abs(this.points[0].x - this.points[1].x) * Math.abs(this.points[0].y - this.points[2].y))
        // }
      }

      draw() {
        p5.push();
        //p5.translate(0,100,0);
        if(plainMode) {
          p5.scale(this.scale);
          p5.rotate(radians(this.rotation));
          p5.translate(this.position.x, this.position.y, this.position.z);
          p5.rotate(radians(this.rotation)*-5);
          p5.fill(this.color);
          if(this.points.length === 3) {
            if(this.initialPosition.y > 150 && Math.random() < 0.02 && p5.millis()%100 > 50) {
              //console.log("sdfsd")
              let colors = [ '#e14206', '#83002e', '#419fc9', '#55c25f' ]
              let ic = Math.round(Math.random()*(colors.length-1));
              p5.fill(colors[ic]);
              p5.triangle(this.points[0].x + 0.025, this.points[0].y + 0.025, this.points[1].x + 0.025, this.points[1].y + 0.025, this.points[2].x + 0.025, this.points[2].y + 0.025);
              p5.fill(this.color);
            }
            p5.triangle(this.points[0].x, this.points[0].y, this.points[1].x, this.points[1].y, this.points[2].x, this.points[2].y);
          } else {
            p5.beginShape();
            for(var i = 0; i < this.points.length; i++) {
              p5.vertex(this.points[i].x, this.points[i].y);
            }
            p5.endShape();
          }
        } else {
          p5.scale(this.scale);
          p5.rotate(radians(this.rotation));
          p5.translate(this.position.x, this.position.y, this.position.z);
          p5.rotate(radians(this.rotation)*-5);
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

      move(sy) {
        
        var sMin = 0;
        var scrollY = sy;
        if(scrollY < sMin) scrollY = sMin; 

        if(scrollY && scrollY > sMin && this.time < 0) {
          this.time = p5.millis();
        } else if(scrollY == 0 && this.time >= 0) {
          this.time = -1;
        }
        
        if(p5.millis() - this.time > this.delay) {
          var r = p5.map(scrollY - (p5.height*0.1 + this.initialPosition.x*-0.5), 0, p5.height*0.25, 0, 1);
          var s = p5.map(scrollY - (p5.height*0.15 + this.initialPosition.x*-0.5), 0, p5.height/5, 0, 1);
          var y = p5.map(scrollY - (p5.height*0.25 + this.initialPosition.y*-1), 0, p5.height/2, 0, 1);
          var x = p5.map(scrollY - (p5.height*0.25 + this.initialPosition.y*-1), 0, p5.height/2, 0, 1);
          if(y < 0) y = 0;
          if(y > 1) y = 1;
          if(x < 0) x = 0;
          if(x > 1) x = 1;
          if(s < 0) s = 0;
          if(s > 1) s = 1;
          if(r < 0) r = 0;
          if(r > 1) r = 1;

          this.currentPosition.x = this.finalPosition.x*x + this.initialPosition.x*(1-x);
          this.currentPosition.y = this.finalPosition.y*y + this.initialPosition.y*(1-y);
          this.currentPosition.z = p5.map(p5.brightness(this.color), 0, 100, 0, 100)*s;

          // this.position.x += this.velocity.x;
          // this.position.y += this.velocity.y;
          // this.position.z += this.velocity.z;

          this.position.x += (this.currentPosition.x - this.position.x) * p5.map(s, 0, 1, 0.35, 0.05);
          this.position.y += (this.currentPosition.y - this.position.y) * p5.map(s, 0, 1, 0.35, 0.05);
          this.position.z += (this.currentPosition.z - this.position.z) * p5.map(s, 0, 1, 0.25, 0.01);

          this.scale = 1 + p5.map(p5.brightness(this.color), 0, 100, -0.25, 0.25)*s;

          this.rotation += p5.map(p5.brightness(this.color), 0, 100, 0.8, -0.8) * r;
          this.rotation = this.rotation % 360;
          this.rotation *= p5.map(r, 0, 1, 0.7, 1);

          // this.velocity.x *= 0.93;
          // this.velocity.y *= 0.94;
          // this.velocity.z *= 0.96;
        }
      }
      
    }

  }
}