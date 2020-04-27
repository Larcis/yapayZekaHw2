function GeneticAlgorithm(props) {
    this.mutation_probability = props.mutation_probability; //olusan cocugun mutasyon gecırme olasılıgı 0-1 aralıgında
    this.timeout = props.timeout || 999999; //algoritmanın maksimum calısabılecegı sure ms cinsinden
    this.population_size = props.population_size || 100; //populasyon icerisindeki toplam birey sayısı
    this.fitness_function = props.fitness_function; //algoritmada kullanılacak fitness fonksiyonu
    this.individual_length = props.individual_length || 3 * N; //bireyin uzunlugu(atacagı adım sayısı)
    this.keep_alive_rate = props.keep_alive_rate || 0.5; //oncekı populasyondan dırek olarak yenı populasyona aktarılma yuzdesı 
    this.sp = 0;
    this.population = []; //populasyon
    this.probabilities = []; //fitness degerlerı normalize edilmis
    this.start_time = 0; //algoritmanın baslatılma zamanı
    this.max_score = 0; //generasyondakı maksımum skor
    this.best_fit_ind = null; //generasyondakı en yuksek skora sahıp bırey
    this.graphic_data = []; //maks score degısımını gosteren grafik icin data
    /**
     * ilk generasyonu rastgele üretme fonksiyonu
     * bu fonksiyonda keep_alive_rate e gore bolunme ındexi de belırlenıyor
     */
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

    /**
     * Yenı generasyon uretme fonksıyonu
     * adımlar:
     * -o anki populasyon icin accumulate array olusturuluyor ve timeout kontrol edılıyor
     * -accumulate dizisini olusutururken elde ettigimiz en iyi birey cizdirilir
     * -yeni populasyona o ankı populasyonun keep_alive_rate i kadarı direk olarak aktarılır
     * -yeni populasyonun boyutunu o anki ile aynı hale getirecek  kadar yenı eleman uretılır ve eklenır
     * -o anki populasyon yenisi ile değiştirilir
     */
    this.create_next_generation = function() {

        if (!this.create_acumulate_array() || (Date.now() - this.start_time) > this.timeout) {
            return this.best_fit_ind;
        }
        this.draw_best_fit(this.best_fit_ind);

        this.graphic_data.push(Math.round(this.max_score * 100) / 100);
        let new_population = this.population.slice(0, this.sp);
        for (let i = 0; i < (this.population.length - this.sp); i++) {
            //populasyondan olasılıkları yuksek olanlara oncelık verecek sekılde rastgele ıkı bırey sec
            let x = this.random_selection();
            let y = this.random_selection();
            //cocuktakı her gen ıcın yuzde 50 ihtimalle  x ten ya da yuzde 50 ihtimalle y den gen sec(crossover)
            let child = this.reproduce(x, y);
            if (Math.random() < this.mutation_probability) { //cocuk mutasyona ugrasın mı? mutation_probability olasılıgıyla
                //rastgele uzunlukta bır gen dızısı olustur ve cocugun boyu degısmeyecek sekılde cocukta rastgele bır yere yerlestır
                child = this.mutate(child);
            }
            //natural selection şart yoksa algoritma ilerlemiyor.
            //cocuk, anne veya babadan en ıyı fıtnessa sahıp olanı yenı nesıle ekle
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
        this.population = new_population; //o ankı populasyon yenı popusyonun yerıne gectı
        return null;
    };

    /**
     * engele veya koselere carpana kadar bireye gore hareket et ve bastıgın koordinatları global gridde visited olarak isaretle
     */
    this.draw_best_fit = function(ind) {
            let xy = [1, 1];
            for (let k = 0; k < ind.length; k++) {
                xy = step(ind[k], xy);
                if (xy[0] < 1 || xy[1] < 1 || xy[0] > N || xy[1] > N || grid[index(...xy)].type == CELL_TYPES.WALL) break;
                grid[index(...xy)].type = CELL_TYPES.VISITED;
            }
        }
        /**
         * O anki populasyon icin accumulate array olustur
         * adımlar:
         * -populasyondakı her eleman ıcın fitness degerı hesaplat(eger birey sona ulasmıssa fitness fonksiyonu 666666 dondurur ve algorıtma durur)
         * -fitness degerlernını normalıze et
         * -kucukten buyuge sırala
         * -en uygun bıreyı set etasdasd u
         */
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
        /**
         * Sıralı bır olasılık dızısınden cdf e gore eleman secer
         * adımlar:
         * - 0-1 aralıgında rastgele bır sayı uret
         * - bu sayı olasılık dızısınde nereye gelıyor lınear search ıle bul
         * - bu ındıse denk gelen bıreyı dondur
         */
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
    /**
     * verilen iki atadan her bir geni yuzde 50 olasılıkla anneden veya babadan alarak
     * bir child olusturur ve dondurur
     */
    this.reproduce = function(ind1, ind2) {
        let child = "";
        for (let i = 0; i < ind1.length; i++) {
            child += Math.random() > 0.5 ? ind1[i] : ind2[i];
        }
        console.assert(ind1.length === child.length, { child, ind1 });
        return child;
    };

    /**
     * rastgele uzunlukta bır rastgele hareketler dızısı olusturur ve bu dızıyı verılen bıreye ekler. 
     */
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