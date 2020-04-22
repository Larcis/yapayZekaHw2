function GeneticAlgorithm(props) {
    this.mutation_probability = props.mutation_probability;
    //this.crossover_point = props.crossover_point;
    this.timeout = props.timeout;
    this.population_size = props.population_size;
    this.fitness_function = props.fitness_function;
    this.individual_length = props.individual_length;
    this.population = [];
    this.start_time = 0;
    this.max_score = 0;
    this.best_fit_ind = null;
    this.create_first_generation = function() {
        for (let i = 0; i < this.population_size; i++) {
            let new_ind = "";
            for (let j = 0; j < this.individual_length; j++) {
                new_ind += randgen(1, 4);
            }
            this.population.push(new_ind);
        }
        // console.log(this.population);
        this.start_time = Date.now();
    };

    this.create_next_generation = function() {
        /*if (this.population.length < 1 ||
            this.start_time == 0 ||
            current_state != STATES.SOLVE) return null;*/
        let new_population = [];
        for (let i in this.population) {
            let x = this.random_selection(this.population, this.fitness_function);
            let y = this.random_selection(this.population, this.fitness_function);
            let child = this.reproduce(x, y);
            if (Math.random() < this.mutation_probability) {
                child = this.mutate(child);
            }
            /*let xy = [1, 1];
            console.log(x, y, child);
            for (let k = 0; k < child.length; k++) {
                xy = step(child[k], xy);
                if (xy[0] < 1 || xy[1] < 1 || xy[0] > N || xy[1] > N || grid[index(...xy)].type == CELL_TYPES.WALL) break;
                grid[index(...xy)].type = CELL_TYPES.VISITED;
            }*/
            new_population.push(child);
        }
        this.population = new_population;
        if (this.max_score >= N * 2 ** (1 / 2) || (Date.now() - this.start_time) > this.timeout)
            return this.best_fit_ind;
        return null;
    };

    this.random_selection = function(population, ff) {
        let probabilities = [];
        let sum = 0;
        for (let i = 0; i < population.length; i++) {
            let current_fit = ff(population[i]);
            if (current_fit > this.max_score) {
                this.max_score = current_fit;
                this.best_fit_ind = population[i];
            }
            probabilities.push(current_fit);
            sum += current_fit;
        }
        for (let i = 0; i < probabilities.length; i++) {
            probabilities[i] /= sum;
        }
        probabilities.sort();
        let rnd = Math.random();

        // console.log(probabilities, rnd);
        if (probabilities[0] >= rnd)
            return population[0];
        for (let i = 1; i < probabilities.length; i++) {
            probabilities[i] += probabilities[i - 1];
            if (probabilities[i] >= rnd)
                return population[i];
        }
        return population[0];
    };

    this.reproduce = function(ind1, ind2) {
        let child = "";
        for (let i = 0; i < ind1.length; i++) {
            child += Math.random() > 0.5 ? ind1[i] : ind2[i];
        }
        return child;
    };

    this.mutate = function(ind) {
        // console.log(ind);
        let size = randgen(0, ind.length / 2);
        let idx = randgen(0, ind.length - 1 - size);
        let mutated = ind.substr(0, idx);
        for (let i = 0; i < size; i++) {
            mutated += randgen(1, 4);
        }
        mutated += ind.substr(idx + size, ind.length);
        return mutated;
    };
};