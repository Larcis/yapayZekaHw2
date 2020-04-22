function setup() {
    var canvas = createCanvas(600, 600);
    canvas.parent("maze");
    noLoop();
}

function draw() {
    background(31);
    frameRate(0.1);
    for (var i = 0; i < grid.length; i++) {
        grid[i].show();
    }
}