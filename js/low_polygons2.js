function createSketch (settings) {

	return function (p5) {

    var dataLoaded = false;
    var data;

    axios.get("low_polygons.json").then(function(response) {
      data = response.data;
      //clean();
      dataLoaded = true;
      console.log(data)
    }).catch(function (error) {
      console.log(error);
    });

    let triangles = []

    p5.setup = () => {
      p5.createCanvas(p5.windowWidth, p5.windowHeight, p5.WEBGL);
      p5.background(0);
      p5.noStroke();
    }

    p5.draw = () => {
      if(dataLoaded) {

        if(triangles.length == 0) createTriangles();

        p5.colorMode(p5.HSB, 360, 100, 100);
        p5.background(0);
        p5.scale(1.5);

        p5.rotateY(p5.map(p5.mouseX, 0, p5.width, -p5.radians(5), p5.radians(5)));
        p5.rotateX(p5.map(p5.mouseY, 0, p5.height, p5.radians(5), -p5.radians(5)));
        for(var i = 0; i < triangles.length; i++) {
          p5.push();
            triangles[i].draw();
            triangles[i].move();
            p5.pop();
        }
      }
    }

    p5.mousePressed = () => {
      for(var i = 0; i < triangles.length; i++) {
        triangles[i].crash();
      }
    }

    function createTriangles() {

      for(var i = 0; i < data.triangles.length; i++) {
        triangles.push(new Triangle(data.triangles[i].points, data.triangles[i].color));
      }

    }

    function clean () {

      for(var i = 0; i < data.triangles.length; i++) {
        
        var x = (data.triangles[i].points[0].x + data.triangles[i].points[1].x + data.triangles[i].points[2].x) / 3;
        var y = (data.triangles[i].points[0].y + data.triangles[i].points[1].y + data.triangles[i].points[2].y) / 3;
        data.triangles[i].color = color("#" + data.triangles[i].color);
        // data.triangles[i].color = color(Math.random()*360, 60, brightness(data.triangles[i].color));
        data.triangles[i].visible = true; // (dist(x, y, data.width/2, data.height/2) < 150);
      }

    }


    class Triangle {

      constructor(points, color) {
        this.points = points;
        this.position = { x: 0, y: 0, z: 0 };
        this.velocity = { x: 0, y: 0, z: 0 };
        this.initialPosition = { x: 0, y: 0, z: 0 };
        this.color = p5.color('#' + color);

        this.getPosition();
      }
      
      getPosition = () => {
        if(this.points.length == 0) return;

        let x = 0, y = 0, z = 0;
        for(let i = 0; i < this.points.length; i++) {
          x += this.points[i].x;
          y += this.points[i].y;
          z += this.points[i].z;
        }

        x /= this.points.length;
        y /= this.points.length;
        z /= this.points.length;

        this.position = { x, y, z };
        this.initialPosition = { ...this.position }

        for(let i = 0; i < this.points.length; i++) {
          this.points[i].x = this.points[i].x - this.position.x;
          this.points[i].y = this.points[i].y - this.position.y;
          this.points[i].z = this.points[i].z - this.position.z;
        }
      }

      draw = () => {
        p5.rotate(p5.map(this.velocity.x, 0, p5.width, 0, p5.radians(1000)));
        p5.translate(this.position.x, this.position.y, this.position.z);
        p5.fill(this.color);
        p5.triangle(this.points[0].x, this.points[0].y, this.points[1].x, this.points[1].y, this.points[2].x, this.points[2].y);
      }

      move = () => {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        this.position.z += this.velocity.z;

        this.position.x += (this.initialPosition.x - this.position.x) * 0.05;
        this.position.y += (this.initialPosition.y - this.position.y) * 0.05;
        this.position.z += (this.initialPosition.z - this.position.z) * 0.05;

        this.velocity.x *= 0.93;
        this.velocity.y *= 0.94;
        this.velocity.z *= 0.96;
      }

      crash = () => {
        this.velocity.x = -50 + Math.random() * 100;
        this.velocity.y = -50 + Math.random() * 100;
        this.velocity.z = -50 + Math.random() * 100;
      }
      
    }
  }
}

let myp5 = new p5(createSketch())