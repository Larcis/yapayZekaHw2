function setup() {
    var canvas = createCanvas(600, 600);
    canvas.parent("maze");
    textSize(20);
    textAlign(CENTER, TOP);
}

function draw() {
    background(31);
    frameRate(30);
    if (current_state == STATES.SOLVE) {
        let res = GA.create_next_generation(); //create next generation in each frame
        if (res) {
            console.log("RESULT:" + res);
            setState(STATES.SHOW_OUTPUT);
            drawResult(res);
            makeChart(GA.graphic_data);
        }
        drawCells();
        clearVisitedCells();
    } else if (current_state == STATES.SHOW_OUTPUT) {
        drawCells();
    } else if (current_state == STATES.TAKE_INPUT) {
        draw_take_input();
    }
}
let generation_count = 0;

function drawCells() {
    stroke(119);
    strokeWeight(1);
    grid[index(1, 1)].type = CELL_TYPES.START;
    grid[index(N, N)].type = CELL_TYPES.FINISH;
    for (var i = 0; i < grid.length; i++) {
        grid[i].show();
    }
    if (current_state == STATES.SOLVE) {
        generation_count++;
    }
    fill(234, 98, 39);
    strokeWeight(3);
    stroke(255);
    text("Generation Count: " + generation_count, 0, 2, width);
}

function draw_take_input() {
    background(255)
    textSize(20);
    textAlign(CENTER);
    fill(234, 98, 39);
    stroke(0);
    strokeWeight(0.31);
    text("Taking Input", width / 2, height / 2);
    generation_count = 0;
}

function clearVisitedCells() {
    for (var i = 0; i < grid.length; i++) {
        if (grid[i].type == CELL_TYPES.VISITED) {
            grid[i].type = CELL_TYPES.FREE;
        }
    }
}

function drawResult(res) {
    let xy = [1, 1];
    for (let i = 0; i < res.length - 1; i++) {
        xy = step(res[i], xy);
        if (grid[index(...xy)].type == CELL_TYPES.FINISH || grid[index(...xy)].type == CELL_TYPES.WALL)
            break;
        grid[index(...xy)].type = CELL_TYPES.PATH;
    }
}