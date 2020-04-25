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
    // console.log("N:", N, "x,", x, "y", y, "    ", (N - x) ** 2, (N - y) ** 2, "WTF", Math.sqrt(((N - x) ** 2) + ((N - y) ** 2)));
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
                console.log("asd");
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
    K = 20;
    w = 600 / (N + 2);
    generate_template_maze();
    generate_random_obstacles()
    current_state = STATES.SOLVE;
    GA = new GeneticAlgorithm({
        mutation_probability: 0.3,
        timeout: 999999,
        population_size: 1000,
        fitness_function: usefull_ff2,
        individual_length: 4 * N

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

function makeChart() {
    let miktar = [72, 52, 46, 35, 33];
    let markalar = ['Samsung', 'Huawei', 'Apple', 'Xiaomi', 'Oppo'];
    let canvas = document.getElementById('chart');

    let graphic = new Chart(canvas, {
        type: 'line',
        data: {
            labels: markalar,
            datasets: [{
                label: '2018Q3 Telefon Satışı',
                data: miktar,
                backgroundColor: [
                    "rgba(255, 99, 132, 0.2)",
                    "rgba(54, 162, 235, 0.2)",
                    "rgba(255, 206, 86, 0.2)",
                    "rgba(75, 192, 192, 0.2)",
                    "rgba(153, 102, 255, 0.2)"
                ],
                borderColor: [
                    "rgba(255, 99, 132, 1)",
                    "rgba(54, 162, 235, 1)",
                    "rgba(255, 206, 86, 1)",
                    "rgba(75, 192, 192, 1)",
                    "rgba(153, 102, 255, 1)"
                ],
                borderWidth: 1
            }],

        }
    });
}

makeChart();
/*console.log("population: ", GA.population);
console.log("crossover: ", GA.population[0], GA.population[1], GA.reproduce(GA.population[0], GA.population[1]));
console.log("mutation: ", GA.mutate(GA.population[0]));
console.log("Random Selection: ", GA.random_selection(GA.population, GA.fitness_function));
console.log("Fitness Function: ", GA.fitness_function(GA.population[4]));*/