let N; // Maze satır sütun değişkeni
let w = 10; // Bir cell büyüklüğü
let grid = []; // Cell array
let colors = [
    [236, 236, 236],
    [250, 116, 79],
    [34, 40, 49]
]


let CELL_TYPES = {
    FREE: 0,
    VISITED: 1,
    WALL: 2
}

function setup() {
    createCanvas(400, 400);

    N = floor(width / w);

    for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
            let cell = new Cell(i, j);
            cell.type = Math.floor(Math.random() * 3);
            grid.push(cell);
        }
    }
}

function draw() {
    background(31);
    frameRate(5);

    for (var i = 0; i < grid.length; i++) {
        grid[i].show();
    }

}

function index(i, j) {
    if (i < 0 || j < 0 || i > N - 1 || j > N - 1) {
        return -1;
    }
    return i + j * cols;
}

function Cell(x, y) {
    this.x = x;
    this.y = y;
    this.type = CELL_TYPES.FREE;

    this.show = function() {
        var x = this.x * w;
        var y = this.y * w;
        stroke(255);
        line(x, y, x + w, y);
        line(x + w, y, x + w, y + w);
        line(x + w, y + w, x, y + w);
        line(x, y + w, x, y);
        fill(...(colors[this.type]));
        rect(x, y, w, w);
    }
}
/*
function Cell(i, j) {
    this.i = i;
    this.j = j; //top   right bottom left
    this.walls = [true, true, true, true];
    this.visited = false;

    this.checkNeighbors = function() {
        var neighbors = [];

        var top = grid[index(i, j - 1)];
        var right = grid[index(i + 1, j)];
        var bottom = grid[index(i, j + 1)];
        var left = grid[index(i - 1, j)];

        if (top && !top.visited) {
            neighbors.push(top);
        }
        if (right && !right.visited) {
            neighbors.push(right);
        }
        if (bottom && !bottom.visited) {
            neighbors.push(bottom);
        }
        if (left && !left.visited) {
            neighbors.push(left);
        }

        if (neighbors.length > 0) {
            var r = floor(random(0, neighbors.length));
            return neighbors[r];
        } else {
            return undefined;
        }

    }

    this.show = function() {
        var x = this.i * w;
        var y = this.j * w;
        stroke(255);

        if (this.walls[0]) {
            line(x, y, x + w, y);
        }
        if (this.walls[1]) {
            line(x + w, y, x + w, y + w);
        }
        if (this.walls[2]) {
            line(x + w, y + w, x, y + w);
        }
        if (this.walls[3]) {
            line(x, y + w, x, y);
        }

        if (this.visited) {
            fill(255, 0, 255, 100);
            rect(x, y, w, w);
        }

    }

}*/