let NUM_BALLS = 50,
    DAMPING = 0.7,
    GRAVITY = 0.3,
    SPEED = 0.3;

let canvas, ctx, TWO_PI = Math.PI * 2, balls = [], mouse = {down:false,x:0,y:0};

window.requestAnimFrame =
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function(callback) {
        window.setTimeout(callback, 1000 / 60);
    };

var id = 0

let Ball = function(x, y, radius, emoji) {
    this.id = id++;
    this.x = x;
    this.y = y;
    this.px = x;
    this.py = y;
    this.fx = 0;
    this.fy = 0;
    this.radius = radius;
    this.emoji = emoji;
};

Ball.prototype.apply_force = function(delta) {

    delta *= delta;
    this.fy += GRAVITY + Math.random() + 0.2;
    this.x += this.fx * delta;
    this.y += this.fy * delta;
    this.fx = this.fy = 0;
};

Ball.prototype.verlet = function() {

    var nx = (this.x * 2) - this.px;
    var ny = (this.y * 2) - this.py;

    this.px = this.x;
    this.py = this.y;

    this.x = nx;
    this.y = ny;
};

Ball.prototype.draw = function(ctx,color) {

    ctx.beginPath();
    // ctx.arc(this.x, this.y, this.radius, 0, TWO_PI);
    ctx.arc(this.x, this.y, 30, 0, TWO_PI);
    //this.id === 1 ? ctx.fillStyle = '#e8112d': ctx.fillStyle = color;
    //ctx.stroke();
    // ctx.strokeStyle = "#e8112d";
    //ctx.fill();
    ctx.font = "60px Arial";
    ctx.textAlign="center";
    ctx.fillText("😂", this.x + 15, this.y + 15);
};


var resolve_collisions = function(ip) {

    var i = balls.length;

    while (i--) {

        var ball_1 = balls[i];

        var n = balls.length;

        while (n--) {

            if (n == i) continue;
          
            var ball_2 = balls[n];

            var diff_x = ball_1.x - ball_2.x;
            var diff_y = ball_1.y - ball_2.y;

            var length    = diff_x * diff_x + diff_y * diff_y;
            var dist      = Math.sqrt(length);
            var real_dist = dist - (ball_1.radius + ball_2.radius);

            if (real_dist < 0) {

                var vel_x1 = ball_1.x - ball_1.px;
                var vel_y1 = ball_1.y - ball_1.py;
                var vel_x2 = ball_2.x - ball_2.px;
                var vel_y2 = ball_2.y - ball_2.py;

                var depth_x = diff_x * (real_dist / dist);
                var depth_y = diff_y * (real_dist / dist);

                ball_1.x -= depth_x * 0.5;
                ball_1.y -= depth_y * 0.5;
                
                ball_2.x += depth_x * 0.5;
                ball_2.y += depth_y * 0.5;

                if (ip) {

                    var pr1 = DAMPING * (diff_x*vel_x1+diff_y*vel_y1) / length,
                        pr2 = DAMPING * (diff_x*vel_x2+diff_y*vel_y2) / length;

                    vel_x1 += pr2 * diff_x - pr1 * diff_x;
                    vel_x2 += pr1 * diff_x - pr2 * diff_x;

                    vel_y1 += pr2 * diff_y - pr1 * diff_y;
                    vel_y2 += pr1 * diff_y - pr2 * diff_y;

                    ball_1.px = ball_1.x - vel_x1;
                    ball_1.py = ball_1.y - vel_y1;

                    ball_2.px = ball_2.x - vel_x2;
                    ball_2.py = ball_2.y - vel_y2;
                }
            }
        }
    }
};

var check_walls = function() {

    var i = balls.length;

    while (i--) {
        var ball = balls[i];
        if (ball.x < ball.radius) {

            var vel_x = ball.px - ball.x;
            ball.x = ball.radius;
            ball.px = ball.x - vel_x * DAMPING;

        } else if (ball.x + ball.radius > canvas.width) {

            var vel_x = ball.px - ball.x;
            ball.x = canvas.width - ball.radius;
            ball.px = ball.x - vel_x * DAMPING;
        }
 
// top Corner rules
//         if (ball.y < ball.radius) {

//             var vel_y = ball.py - ball.y;
//             ball.y = ball.radius;
//             ball.py = ball.y - vel_y * DAMPING;

//         } 
         if (ball.y + ball.radius > canvas.height) {

            var vel_y = ball.py - ball.y;
            ball.y = canvas.height - ball.radius;
            ball.py = ball.y - vel_y * DAMPING;
        }
    }
};

var update = function() {

    var iter = 1;

    var delta = SPEED / iter;

    while (iter--) {

        var i = balls.length;

        while (i--) {

            balls[i].apply_force(delta);
            balls[i].verlet();
        }

        resolve_collisions();
        check_walls();

        var i = balls.length;
        while (i--) balls[i].verlet();

        resolve_collisions(1);
        check_walls();
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    var i = balls.length;
 
    while (i--) balls[i].draw(ctx, '#fff');

    requestAnimFrame(update);
};



var add_ball = function(x, y, r) {
   
    var x = x || Math.random() * (canvas.width - 60) + 30,
        y = y || Math.random() * (canvas.height - 60) - canvas.height,
        r = r || 10 + Math.random() * 25,
        s = true,
        i = balls.length;
 
    while (i--) {
        var ball = balls[i];
        var diff_x = ball.x - x;
        var diff_y = ball.y - y;
        var dist = Math.sqrt(diff_x * diff_x + diff_y * diff_y);

        if (dist < ball.radius + r) {
            s = false;
            break;
        }
    }

    if (s) balls.push(new Ball(x, y, r,));
};

window.addEventListener('resize', resizeCanvas, false);

function resizeCanvas() {
 canvas.width = window.innerWidth;
 canvas.height = window.innerHeight;
}


window.onload = function() {

    canvas = document.getElementById('poster');
    ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;;
    canvas.height = window.innerHeight;
    
    while (NUM_BALLS--) add_ball();

   

    canvas.oncontextmenu = function(e) {

        e.preventDefault();
        return false;
    };
   
    update();
 
    function isIntersect(point, circle) {
     return Math.sqrt((point.x-circle.x) ** 2 + (point.y - circle.y) ** 2) < circle.radius;
   }
   canvas.addEventListener('click', (e) => {
     const pos = {
       x: e.clientX,
       y: e.clientY
     };
     balls.forEach(ball => {
       if (isIntersect(pos, ball)) {
         console.log('click on circle: ' + ball.id);
         if (ball.id === 1) {
          alert('RED BALL')
         } else {
showMessage()
         }
       }
     });
   });
 
  // Show Text Block
  let currentStep = 0;
  const messageArr = ['text 1', 'text 2', 'text 3', 'text 4', 'text 5'];
 
  function showMessage() {
     alert(messageArr[currentStep]);
     currentStep++;
     if (currentStep === messageArr.length) {
       currentStep = 0;
     }
  }
 
};