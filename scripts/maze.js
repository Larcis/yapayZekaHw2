function randgen(start, end) {
    return Math.round(Math.random() * (end - start)) + start;
};

let N; // Maze satır sütun değişkeni
let K; // Engel Sayısı
let w; // Bir cell büyüklüğü
let grid = []; // Cell array
let GA = null; // Genetic Algorithm

let colors = [
    [236, 236, 236],
    [234, 98, 39],
    [34, 40, 49],
    [3, 90, 166],
    [199, 0, 57],
    [24, 176, 176]
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
    FINISH: 4,
    PATH: 5
};

function index(i, j) {
    if (i < 0 || j < 0 || i > N + 1 || j > N + 1) { return -1; }
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

function generate_random_obstacles() {
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
}

function step(dir, xy) {
    switch (dir) {
        case "1": // Left
            xy[1]--;
            break;
        case "2": // Up
            xy[0]--;
            break;
        case "3": // Right
            xy[1]++;
            break;
        case "4": // Down
            xy[0]++;
            break;
    }
    return xy;
}

function euclid(x, y) {
    return Math.sqrt(((N - x) ** 2) + ((N - y) ** 2));
}

function manhattan(x1, y1, x2, y2) {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}

function until_wall_ff(ind) {
    let xy = [1, 1];
    let score = 1;
    console.log(ind);
    for (let i = 0; i < ind.length; i++) {
        xy = step(ind[i], xy);
        if (grid[index(...xy)].type == CELL_TYPES.WALL) {
            return score;
        }
        grid[index(...xy)].type = CELL_TYPES.VISITED;
        score++;
    }
    return score;
}

function euclid_ff(ind) {
    let xy = [1, 1];
    // console.log(ind);
    for (let i = 0; i < ind.length; i++) {
        xy = step(ind[i], xy);
        if (grid[index(...xy)].type == CELL_TYPES.WALL || grid[index(...xy)].type == CELL_TYPES.START) {
            // console.log("duvardan bittim", xy);
            return N * 2 ** (1 / 2) - euclid(...xy);
        }
        grid[index(...xy)].type = CELL_TYPES.VISITED;
    }
    // console.log("sonuna kadar gittim", xy);
    return N * 2 ** (1 / 2) - euclid(...xy);
}

function usefull_ff(ind) {
    let xy = [1, 1];
    let currently_visited = {};
    let i = 0;
    for (i = 0; i < ind.length; i++) {
        xy = step(ind[i], xy);
        if (grid[index(...xy)].type == CELL_TYPES.FINISH)
            return 999999;
        if (grid[index(...xy)].type == CELL_TYPES.WALL ||
            grid[index(...xy)].type == CELL_TYPES.START ||
            currently_visited[xy[0] + "_" + xy[1]]
        ) {
            return manhattan(...xy, 1, 1) + manhattan(...xy, N, N) / (i + 1); //N * 2 - euclid(...xy) + 3 / (i + 1);
        }
        currently_visited[xy[0] + "_" + xy[1]] = true;
    }
    return manhattan(...xy, 1, 1) + manhattan(...xy, N, N) / (i + 1); //N * 2 - euclid(...xy) + 3 / (i + 1);;
}

function usefull_ff2(ind) {
    let xy = [1, 1];
    let i = 0;
    let idx;
    for (i = 0; i < ind.length; i++) {
        xy = step(ind[i], xy);
        idx = index(...xy);
        if (idx != -1) {
            if (grid[idx].type == CELL_TYPES.FINISH) {
                return 666666;
            }
            if (grid[idx].type == CELL_TYPES.WALL ||
                grid[idx].type == CELL_TYPES.START
            ) {
                return manhattan(...xy, 1, 1) / (i + 1) + 2 * N - manhattan(...xy, N, N);
            }
        } else {
            return manhattan(...xy, 1, 1) / (i + 1) + 2 * N - manhattan(...xy, N, N);
        }
    }
    return manhattan(...xy, 1, 1) / (i + 1) + 2 * N - manhattan(...xy, N, N);
}

function generate_template_maze() {
    grid = [];
    for (let i = 0; i <= (N + 1); i++) {
        for (let j = 0; j <= (N + 1); j++) {
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
}

function start_solve() {
    if (current_state != STATES.TAKE_INPUT) return;
    let M, timeout, populationSize, mutationProbability, keepAliveRate;
    [N, K, M, timeout, populationSize, mutationProbability, keepAliveRate] = getValuesFromUI();
    w = 600 / (N + 2);
    if (N < 4) K = 0;
    generate_template_maze();
    generate_random_obstacles()
    setState(STATES.SOLVE);
    GA = new GeneticAlgorithm({
        mutation_probability: mutationProbability,
        timeout: timeout,
        population_size: populationSize,
        fitness_function: usefull_ff2,
        individual_length: M,
        keep_alive_rate: keepAliveRate

    });
    GA.create_first_generation();
}

function getValuesFromUI() {
    let N = document.getElementById("maze_size").value;
    let K = document.getElementById("obstacleNumber").value;
    let M = document.getElementById("stepSize").value;
    let timeout = document.getElementById("timeout").value;
    let populationSize = document.getElementById("populationSize").value;
    let mutationProbability = document.getElementById("mutationProbability").value;
    let keepAliveRate = document.getElementById("keepAliveRate").value;
    if (isNaN(N) || isNaN(K) || isNaN(M) || isNaN(timeout) ||  isNaN(populationSize) || isNaN(mutationProbability) || isNaN(keepAliveRate)) {
        alert("Please Enter Valid input");
        return;
    }
    return [Number(N), Number(K), Number(M), Number(timeout), Number(populationSize), mutationProbability, keepAliveRate];
}

function setState(st) {
    current_state = st;
    chanceButtonAppearance();
}
let btn = document.getElementById("button");

function solveButtonClicked() {
    if (current_state == STATES.TAKE_INPUT) {
        start_solve();
    } else if (current_state == STATES.SHOW_OUTPUT) {
        clearChart();
        setState(STATES.TAKE_INPUT);
    } else if (current_state == STATES.SOLVE) {
        setState(STATES.TAKE_INPUT)
    }
}

function chanceButtonAppearance() {
    let btn = document.getElementById("button");
    btn.className = "";
    switch (current_state) {
        case STATES.TAKE_INPUT:
            btn.className = "btn btn-block btn-primary";
            btn.innerHTML = "Solve &#128640;";
            break;
        case STATES.SOLVE:
            btn.className = "btn btn-block btn-danger";
            btn.innerHTML = "Cancel &#129327;";
            break;
        case STATES.SHOW_OUTPUT:
            btn.className = "btn btn-block btn-info";
            btn.innerHTML = "Refresh &#128166;";
            break;
    }
}

function clearChart() {
    let canvas = document.getElementById('chart');
    let graphic = new Chart(canvas, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Max Score / Generation',
                data: [],
                backgroundColor: "rgba(24, 176, 176, 0.2)",
                borderColor: "rgba(24, 176, 176, 1)",
                borderWidth: 1
            }],
        }
    });
}

function makeChart(score_array) {
    let max_score = score_array;
    let generations = Array.from(Array(max_score.length).keys())
    let canvas = document.getElementById('chart');

    let graphic = new Chart(canvas, {
        type: 'line',
        data: {
            labels: generations,
            datasets: [{
                label: 'Max Score / Generation',
                data: max_score,
                backgroundColor: "rgba(24, 176, 176, 0.2)",
                borderColor: "rgba(24, 176, 176, 1)",
                borderWidth: 1
            }],

        }
    });
}