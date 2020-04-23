function setup() {
    var canvas = createCanvas(600, 600);
    canvas.parent("maze");
    textSize(15);
    textAlign(CENTER);
}
let drawFlag = true;

function draw() {
    background(31);
    frameRate(50);
    if (drawFlag) {
        if (current_state == STATES.SOLVE) {
            let res = GA.create_next_generation();
            if (res) {
                console.log("RESULT:" + res);
                current_state = STATES.SHOW_OUTPUT;
                drawResult(res);
            }
        }
    } else {
        clearVisitedCells();
    }
    drawCells();
    drawFlag = !drawFlag;
}

function drawCells() {
    grid[index(1, 1)].type = CELL_TYPES.START;
    grid[index(N, N)].type = CELL_TYPES.FINISH;
    for (var i = 0; i < grid.length; i++) {
        grid[i].show();
    }
    text(frameCount, width / 2, height / 2);

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