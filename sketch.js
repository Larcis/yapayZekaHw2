function setup() {
    var canvas = createCanvas(600, 600);
    canvas.parent("maze");
    textSize(15);
    textAlign(CENTER);
}
let flag = true;

function draw() {
    background(31);
    frameRate(999);
    if (flag) {
        if (current_state == STATES.SOLVE) {
            let res = GA.create_next_generation();
            if (res) {
                console.log(res);
                current_state = STATES.SHOW_OUTPUT;
                let xy = [1, 1];
                for (let i = 0; i < res.length - 1; i++) {
                    xy = step(res[i], xy);
                    if (grid[index(...xy)].type == CELL_TYPES.FINISH || grid[index(...xy)].type == CELL_TYPES.WALL)
                        break;
                    grid[index(...xy)].type = CELL_TYPES.PATH;
                }
            }

        }
    } else {
        for (var i = 0; i < grid.length; i++) {
            if (grid[i].type == CELL_TYPES.VISITED) {
                grid[i].type = CELL_TYPES.FREE;
            }
        }
    }
    grid[3 + N].type = CELL_TYPES.START;
    for (var i = 0; i < grid.length; i++) {
        grid[i].show();
    }
    text(frameCount, width / 2, height / 2);


    flag = !flag;
}