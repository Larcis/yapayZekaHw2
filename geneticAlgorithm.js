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
        this.start_time = Date.now();
    };

    this.create_next_generation = function() {
        if (this.population.length < 1 ||
            this.start_time == 0 ||
            current_state != STATES.SOLVE) return null;

        let new_population = [];
        for (let i in this.population) {
            let x = this.random_selection(this.population, this.fitness_function);
            let y = this.random_selection(this.population, this.fitness_function);
            let child = this.reproduce(x, y);
            if (Math.random() < this.mutation_probability) {
                child = this.mutate(child);
            }
            new_population.push(child);
        }
        this.population = new_population;
        if (this.max_score < 50 || (Date.now() - this.start_time) > this.timeout)
            return this.best_fit_ind;
        return null;
    };

    this.random_selection = function(population, ff) {
        let probabilities = [];
        let sum = 0;
        for (let i in population) {
            let current_fit = ff(i);
            if (current_fit > this.max_score) {
                this.max_score = current_fit;
                this.best_fit_ind = i;
            }
            probabilities.push(current_fit);
            sum += current_fit;
        }
        let mean_sum = 0;
        for (let i = 0; i < probabilities.length; i++) {
            probabilities[i] /= sum;
            mean_sum += Math.random() > 0.7 ? 0 : (i * probabilities[i]);
        }
        return population[Math.floor(mean_sum)];
    };

    this.reproduce = function(ind1, ind2) {
        let crossover_point = randgen(0, ind1.length - 2);
        return ind1.substring(0, crossover_point) + ind2.substring(crossover_point - 1, ind2.length);
    };

    this.mutate = function(ind) {
        return ind.replaceAt(randgen(0, ind1.length - 1), randgen(1, 4));
    };
};