p5.disableFriendlyErrors = true; 

const DATA_URL = "kw-pieces.json";
const GLITCH = true;
const PLAIN_MODE = true;
const DEPTH = 1.5;
const imageWidth = (screen.width < 720) ? screen.width + 80 : 720;
const START = Date.now();
let height = window.innerHeight;
var imageHeight; // auto
var sketch;

axios.get(DATA_URL).then(function(response) {
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
            data.triangles[i].points[j].z *= DEPTH;
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
            p5.createCanvas(window.innerWidth, window.innerHeight, p5.WEBGL);
            p5.background(0);
            p5.noStroke();
            for(var i = 0; i < data.triangles.length; i++)  fragments.push(new Fragment(data.triangles[i].points, data.triangles[i].color));
            //p5.colorMode(p5.HSB, 360, 100, 100);
        }
        
        p5.draw = function() { 
            let time = Date.now() - START;
            // p5.background(0);
            p5.clear();
            
            var scrollY = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
            if(GLITCH) p5.rotateY(radians(Math.sin(time*0.0001)/2));
            for(var i = 0; i < fragments.length; i++) {
                fragments[i].draw();
                fragments[i].move(scrollY);
            }

            let fps = p5.frameRate();
            if (fps < 24) {
                //console.log(fps.toFixed(2));
            }
        }

        p5.windowResized = function() {
            p5.resizeCanvas(window.innerWidth, window.innerHeight);
            height = window.innerHeight;
        }

        // UTILITIES

        function radians(deg) {
            return  deg * (Math.PI/180)
        }

        function map (value, a, b, c, d) {
            value = (value - a) / (b - a);
            return c + value * (d - c);
        }

        function constrain (value, min, max) {
           return Math.min(Math.max(value, min), max);
        }

        function hexToRgb(hex) {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        }

        function brightness(color) {
            if (color) {
                /*Math.sqrt(
                    0.299 * (color.r * color.r) +
                    0.587 * (color.g * color.g) +
                    0.114 * (color.b * color.b)
                );*/

                return ((color.r*299)+(color.g*587)+(color.b*114))/1000;
            }
        }

        function random(min, max) {
            return Math.random() * (max - min) + min;
        }
        
        function randomInt(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        function distance(initialX, initialY, finalX, finalY) {
            return Math.sqrt( Math.pow((finalX - initialX), 2) + Math.pow((finalY - initialY), 2));
        }
        class Fragment {

            constructor(points, color) {
                this.points = this.sanitizePoints(points);
                this.color = p5.color('#' + color);
                this.rawColor = color;

                this.position = { x: 0, y: 0, z: 0 };
                this.velocity = { x: 0, y: 0, z: 0 };
                this.initialPosition = { x: 0, y: 0, z: 0 };
                this.currentPosition = { x: 0, y: 0, z: 0 };
                this.finalPosition = { x: 0, y: 0, z: 0 };
                this.rotation = 0;
                this.scale = 0;
                this.area = 500;
                
                this.calculateCenter();
                
                this.delay = distance(this.initialPosition.x, this.initialPosition.y, 0, imageHeight/2) * 5 - 1000;
                
                this.time = -1;
                

                // set final position in circle
                const angle = Math.atan2(this.initialPosition.y+140*0, this.initialPosition.x-20*0) + random(radians(-65), radians(65));
                const spread = (screen.width < 720) ? screen.width * 0.4 : 300; 
                const radius = Math.random()*spread + (window.innerHeight/2);

                this.finalPosition.x = Math.cos(angle)*radius;
                this.finalPosition.y = Math.sin(angle)*radius;

                this.glitchTime = Date.now() - START;
            }

            sanitizePoints(points) { // pasado
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
            }

            draw() {
                p5.push();

                p5.scale(this.scale);
                p5.rotate(radians(this.rotation));
                p5.translate(this.position.x, this.position.y, this.position.z);
                p5.rotate(radians(this.rotation)*-5);
                p5.fill(this.color);

                if(this.points.length === 3) {
                    // create glitching triangles
                    if(this.initialPosition.y > 150 && Math.random() < 0.02 && (Date.now() - START)%100 > 50) {
                        let colors = [ '#e14206', '#83002e', '#419fc9', '#55c25f' ]
                        let ic = Math.round(Math.random()*(colors.length-1));
                        p5.fill(colors[ic]);
                        p5.triangle(this.points[0].x + 0.025, this.points[0].y + 0.025, this.points[1].x + 0.025, this.points[1].y + 0.025, this.points[2].x + 0.025, this.points[2].y + 0.025);
                        p5.fill(this.color);
                    }
                    // create triangle
                    p5.triangle(this.points[0].x, this.points[0].y, this.points[1].x, this.points[1].y, this.points[2].x, this.points[2].y);
                } else {
                    p5.beginShape();
                    for(var i = 0; i < this.points.length; i++) {
                        p5.vertex(this.points[i].x, this.points[i].y);
                    }
                    p5.endShape();
                }


                p5.pop();
            }

            move(sy) {
                let sMin = 0;
                let scrollY = sy;
                //console.log(sy);
                if(scrollY < sMin) scrollY = sMin; 

                if(scrollY && scrollY > sMin && this.time < 0) {
                    this.time = Date.now();
                } else if(scrollY == 0 && this.time >= 0) {
                    this.time = -1;
                }
                
                if(Date.now() - this.time > this.delay) {
                    let r = map(scrollY - (height*0.1 + this.initialPosition.x*-0.5), 0, height*0.25, 0, 1);
                    let s = map(scrollY - (height*0.15 + this.initialPosition.x*-0.5), 0, height/5, 0, 1);
                    let y = map(scrollY - (height*0.25 + this.initialPosition.y*-1), 0, height/2, 0, 1);
                    let x = map(scrollY - (height*0.25 + this.initialPosition.y*-1), 0, height/2, 0, 1);

                    r = constrain(r, 0, 1);
                    s = constrain(s, 0, 1);
                    y = constrain(y, 0, 1);
                    x = constrain(x, 0, 1); 

                    this.currentPosition.x = this.finalPosition.x*x + this.initialPosition.x*(1-x);
                    this.currentPosition.y = this.finalPosition.y*y + this.initialPosition.y*(1-y);
                    this.currentPosition.z = map(brightness(hexToRgb(this.rawColor)), 0, 100, 0, 100)*s;

                    // this may be improved if we touch up the speed (velocity vector magnitude)
                    // or if we add acceleration so velocity isnt instantly changed
                    this.velocity.x = (this.currentPosition.x - this.position.x) * map(s, 0, 1, 0.35, 0.05);
                    this.velocity.y = (this.currentPosition.y - this.position.y) * map(s, 0, 1, 0.35, 0.05);
                    this.velocity.z = (this.currentPosition.z - this.position.z) * map(s, 0, 1, 0.25, 0.01);

                    this.position.x += this.velocity.x;
                    this.position.y += this.velocity.y;
                    this.position.z += this.velocity.z;

                    this.scale = 1 + map(brightness(hexToRgb(this.rawColor)), 0, 100, -0.25, 0.25)*s;

                    this.rotation += map(brightness(hexToRgb(this.rawColor)), 0, 100, 0.25, -0.25) * r;
                    this.rotation = this.rotation % 360;
                    this.rotation *= map(r, 0, 1, 0.7, 1);

                }
            }
          
        }

    }
}