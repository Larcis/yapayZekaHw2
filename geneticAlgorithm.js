function GeneticAlgorithm(props) {
    this.mutation_probability = props.mutation_probability;
    //this.crossover_point = props.crossover_point;
    this.timeout = props.timeout;
    this.population_size = props.population_size;
    this.fitness_function = props.fitness_function;
    this.individual_length = props.individual_length;
    this.population = [];
    this.probabilities = [];
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
        this.start_time = Date.now();
        this.create_acumulate_array();
    };

    this.create_next_generation = function() {
        /*if (this.population.length < 1 ||
            this.start_time == 0 ||
            current_state != STATES.SOLVE) return null;*/

        let new_population = [];
        for (let i in this.population) {
            let x = this.random_selection();
            let y = this.random_selection();
            let child = this.reproduce(x, y);
            if (Math.random() < this.mutation_probability) {
                child = this.mutate(child);
            }
            //TODO random selection duzeltıldıkten sonra burası kaldırılıp denenecek 
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
        this.population = new_population;
        this.create_acumulate_array();
        let best_ind = "";
        let ms = 0;
        for (let i = 0; i < this.population.length; i++) {
            let current_fit = this.fitness_function(this.population[i]);
            if (current_fit > ms) {
                this.max_score = ms = current_fit;
                best_ind = this.population[i];
            }
        }
        this.draw_best_fit(best_ind);
        if (this.max_score == 999999 || (Date.now() - this.start_time) > this.timeout)
            return best_ind; //this.best_fit_ind;
        return null;
    };

    this.draw_best_fit = function(ind) {
        let xy = [1, 1];
        console.log(ind, this.max_score);
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
            this.probabilities.push(current_fit);
            sum += current_fit;
        }
        for (let i = 0; i < this.probabilities.length; i++) {
            this.probabilities[i] /= sum;
        }
        this.probabilities.sort();
        //TODO random selection duzgun degıl, duzeltılmelı
    }
    this.random_selection = function() {
        let rnd = Math.random();
        let acc = 0;
        for (let i = 0; i < this.probabilities.length; i++) {
            acc += this.probabilities[i];
            if (acc >= rnd)
                return this.population[i];
        }
        return this.population[0];
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
        let size = randgen(0, ind.length - 1);
        let idx = randgen(0, ind.length - 1 - size);
        let mutated = ind.substr(0, idx);
        for (let i = 0; i < size; i++) {
            mutated += randgen(1, 4);
        }
        mutated += ind.substr(idx + size, ind.length);
        return mutated;
    };
};