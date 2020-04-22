String.prototype.replaceAt = function(index, replacement) {
    return this.substr(0, index) + replacement + this.substr(index + replacement.length);
}

function randgen(start, end) {
    return Math.floor(Math.random() * (end - start)) + start;
};


let N; // Maze satır sütun değişkeni
let K;
let w; // Bir cell büyüklüğü
let grid = []; // Cell array

let colors = [
    [236, 236, 236],
    [250, 116, 79],
    [34, 40, 49],
    [3, 90, 166],
    [199, 0, 57]
];


let STATES = {
    TAKE_INPUT: 0,
    SOLVE: 1,
    SHOW_OUTPUT: 2
};
var current_state = STATES.TAKE_INPUT;

let CELL_TYPES = {
    FREE: 0,
    VISITED: 1,
    WALL: 2,
    START: 3,
    FINISH: 4
};


function index(i, j) {
    if (i < 0 || j < 0 || i > N + 1 || j > N + 1) {
        return -1;
    }
    return i + j * (N + 2);
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

function start_solve() {
    //TODO read params from input boxes;
    if (current_state != STATES.TAKE_INPUT) return;
    N = 20;
    K = 10;
    w = 600 / (N + 2);
    for (let i = 0; i <= N + 1; i++) {
        for (let j = 0; j <= N + 1; j++) {
            let cell = new Cell(i, j);
            if (i == 0 || j == 0 || i == N + 1 || j == N + 1)
                cell.type = CELL_TYPES.WALL;
            else
                cell.type = CELL_TYPES.FREE;
            grid.push(cell);
        }
    }
    grid[index(1, 1)].type = CELL_TYPES.START;
    grid[index(N, N)].type = CELL_TYPES.FINISH;
    for (let i = 0; i < K; i++) {
        let x, y;

        if (Math.random() > 0.5) {
            x = randgen(1, N - 4);
            y = randgen(2, N + 1);
            for (let j = 0; j < 4; j++) {
                grid[index(x + j, y)].type = CELL_TYPES.WALL;
            }
        } else {
            x = randgen(2, N + 1);
            y = randgen(1, N - 4);
            for (let j = 0; j < 4; j++) {
                grid[index(x, y + j)].type = CELL_TYPES.WALL;
            }
        }
    }
    current_state = STATES.SOLVE;
    //TODO genetik algoritma yarat ve first generasyonu yarat, arayuzu kilitle
}

start_solve();