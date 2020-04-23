String.prototype.replaceAt = function(index, replacement) {
    return this.substr(0, index) + replacement + this.substr(index + 1, replacement.length);
}

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
            if (xy[1] > 1) xy[1]--;
            break;
        case "2": // Up
            if (xy[0] > 1) xy[0]--;
            break;
        case "3": // Right
            if (xy[1] <= N) xy[1]++;
            break;
        case "4": // Down
            if (xy[0] <= N) xy[0]++;
            break;
    }
    return xy;
}

function euclid(x, y) {
    // console.log("N:", N, "x,", x, "y", y, "    ", (N - x) ** 2, (N - y) ** 2, "WTF", Math.sqrt(((N - x) ** 2) + ((N - y) ** 2)));
    return Math.sqrt(((N - x) ** 2) + ((N - y) ** 2));
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
    let max = 0;
    let currently_visited = {};
    let current_score = 1;
    for (let i = 0; i < ind.length; i++) {
        xy = step(ind[i], xy);
        current_score = N * 2 ** (1 / 2) - euclid(...xy) + 3 / (i + 1);
        if (grid[index(...xy)].type == CELL_TYPES.FINISH)
            return 999999;
        if (grid[index(...xy)].type == CELL_TYPES.WALL ||
            grid[index(...xy)].type == CELL_TYPES.START ||
            currently_visited[xy[0] + "_" + xy[1]]) {
            return current_score;
        }
        //grid[index(...xy)].type = CELL_TYPES.VISITED;
        currently_visited[xy[0] + "_" + xy[1]] = true;
        //let current_score = N * 2 ** (1 / 2) - euclid(...xy) + 1 / (i + 1); //2 / (euclid(...xy) + 1) + 1 / (i + 1);
        if (current_score > max) {
            max = current_score;
        }
    }
    return current_score;
}

function generate_template_maze() {
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
}

function start_solve() {
    //TODO read params from input boxes;
    if (current_state != STATES.TAKE_INPUT) return;
    N = 20;
    K = 10;
    w = 600 / (N + 2);
    generate_template_maze();
    generate_random_obstacles()
    current_state = STATES.SOLVE;
    GA = new GeneticAlgorithm({
        mutation_probability: 0.6,
        timeout: 999999,
        population_size: 100,
        fitness_function: usefull_ff,
        individual_length: 3 * N

    });
    GA.create_first_generation();

    //TODO genetik algoritma yarat ve first generasyonu yarat, arayuzu kilitle
}

start_solve();

function getValuesFromUI() {
    let N = document.getElementById("maze_size").value;
    let K = document.getElementById("obstacleNumber").value;
    let M = document.getElementById("stepSize").value;
    let timeout = document.getElementById("timeout").value;
    let populationSize = document.getElementById("populationSize").value;
    let mutationProbability = document.getElementById("mutationProbability").value;
    if (isNaN(N) || isNaN(K) || isNaN(M) || isNaN(timeout) ||  isNaN(populationSize) || isNaN(mutationProbability)) {
        alert("Please Enter Valid input");
        return;
    }

    alert(N + K + M + timeout + populationSize + mutationProbability);
}

function solveButtonClicked() {
    getValuesFromUI();
}

/*console.log("population: ", GA.population);
console.log("crossover: ", GA.population[0], GA.population[1], GA.reproduce(GA.population[0], GA.population[1]));
console.log("mutation: ", GA.mutate(GA.population[0]));
console.log("Random Selection: ", GA.random_selection(GA.population, GA.fitness_function));
console.log("Fitness Function: ", GA.fitness_function(GA.population[4]));*/