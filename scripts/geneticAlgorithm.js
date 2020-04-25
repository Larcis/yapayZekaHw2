function GeneticAlgorithm(props) {
    this.mutation_probability = props.mutation_probability;
    this.timeout = props.timeout || 999999;
    this.population_size = props.population_size || 100;
    this.fitness_function = props.fitness_function;
    this.individual_length = props.individual_length || 3 * N;
    this.keep_alive_rate = props.keep_alive_rate || 0.5;
    this.sp = 0;
    this.population = [];
    this.probabilities = [];
    this.start_time = 0;
    this.max_score = 0;
    this.best_fit_ind = null;
    this.graphic_data = [];
    this.create_first_generation = function() {
        for (let i = 0; i < this.population_size; i++) {
            let new_ind = "";
            for (let j = 0; j < this.individual_length; j++) {
                new_ind += randgen(1, 4);
            }
            this.population.push(new_ind);
        }
        this.start_time = Date.now();
        this.sp = Math.round(this.population.length * this.keep_alive_rate);
    };

    this.create_next_generation = function() {

        if (!this.create_acumulate_array() || (Date.now() - this.start_time) > this.timeout) {
            return this.best_fit_ind;
        }
        this.draw_best_fit(this.best_fit_ind);

        this.graphic_data.push(Math.round(this.max_score * 100) / 100);
        let new_population = this.population.slice(0, this.sp);
        for (let i = 0; i < (this.population.length - this.sp); i++) {
            let x = this.random_selection();
            let y = this.random_selection();
            let child = this.reproduce(x, y);
            if (Math.random() < this.mutation_probability) {
                child = this.mutate(child);
            }
            //natural selection şart yoksa algoritma ilerlemiyor.
            let fx = this.fitness_function(x);
            let fy = this.fitness_function(y);
            let fc = this.fitness_function(child);
            if (fc >= fx && fc >= fy) {
                new_population.push(child);
            } else if (fx > fy) {
                new_population.push(x);
            } else {
                new_population.push(y);
            }
        }
        console.assert(this.population.length === new_population.length, { error: "population size changed" });
        this.population = new_population;
        return null;
    };

    this.draw_best_fit = function(ind) {
        let xy = [1, 1];
        for (let k = 0; k < ind.length; k++) {
            xy = step(ind[k], xy);
            if (xy[0] < 1 || xy[1] < 1 || xy[0] > N || xy[1] > N || grid[index(...xy)].type == CELL_TYPES.WALL) break;
            grid[index(...xy)].type = CELL_TYPES.VISITED;
        }
    }

    this.create_acumulate_array = function() {
        this.probabilities = [];
        let sum = 0;
        for (let i = 0; i < this.population.length; i++) {
            let current_fit = this.fitness_function(this.population[i]);
            if (current_fit == 666666) {
                this.best_fit_ind = this.population[i];
                this.max_score = current_fit;
                return false;
            }
            this.probabilities.push(current_fit);
            sum += current_fit;
        }
        for (let i = 0; i < this.probabilities.length; i++) {
            this.probabilities[i] /= sum;
        }
        var list = [];
        for (var j = 0; j < this.probabilities.length; j++)
            list.push({ 'ind': this.population[j], 'prob': this.probabilities[j] });

        list.sort(function(a, b) {
            return a.prob < b.prob;
        });
        for (var k = 0; k < list.length; k++) {
            this.population[k] = list[k].ind;
            this.probabilities[k] = list[k].prob;
        }
        this.best_fit_ind = this.population[this.population.length - 1];
        this.max_score = this.fitness_function(this.population[this.population.length - 1])
        return true;
    }
    this.random_selection = function() {
        let rnd = Math.random();
        let acc = 0;
        for (let i = 0; i < this.probabilities.length; i++) {
            acc += this.probabilities[i];
            if (acc >= rnd) {
                return this.population[i];
            }
        }
        return this.population[this.population.length - 1];
    };

    this.reproduce = function(ind1, ind2) {
        let child = "";
        for (let i = 0; i < ind1.length; i++) {
            child += Math.random() > 0.5 ? ind1[i] : ind2[i];
        }
        console.assert(ind1.length === child.length, { child, ind1 });
        return child;
    };

    this.mutate = function(ind) {
        let size = randgen(0, ind.length - 1);
        let idx = randgen(0, ind.length - 1 - size);
        let mutated = ind.substr(0, idx);
        for (let i = 0; i < size; i++) {
            mutated += randgen(1, 4);
        }
        mutated += ind.substr(idx + size);
        console.assert(ind.length === mutated.length, { mutated, ind });
        return mutated;
    };
};