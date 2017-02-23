interface Parameter {
    title: string;
    val: string;
    min: number;
    max: number;
}


export interface DiscreteDistribution {
    parameters: [Parameter];
    probabilityMassFunction(): number
    cumulativeDistributionFunction(): number
    variance(): number
}


/*
Geometric
Bernouli
Binomial
Poisson
Exponential
Uniform
Normal
*/


export class BinomialDistribution implements DiscreteDistribution {
    parameters = [
        { title: "Number of Trials (n)", val: "n", min: 1, max: Infinity },
        { title: "Probability of Success (p)", val: "p", min: 0, max: 1 },
        { title: "Number of Successes (k)", val: "k", min: 0, max: Infinity }
    ] as [Parameter]

    constructor(public n = 6, public k = 3, public p = 0.5) { }

    probabilityMassFunction(n = this.n, k = this.k, p = this.p) {
        return choose(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
    }

    cumulativeDistributionFunction(n = this.n, k = this.k, p = this.p) {
        let sum = 0;
        for (let i = 1; i <= k; i++) {
            sum += this.probabilityMassFunction(n, i, p);
        }
        return sum;
    }

    variance(n = this.n, p = this.p) {
        return n * p * (1 - p)
    }
}

export class PoissonDistribution implements DiscreteDistribution {
    parameters = [
        { title: "Average number of events per interval (λ)", val: "l", min: 1, max: Infinity },
        { title: "Events in interval (k)", val: "k", min: 0, max: Infinity },
    ] as [Parameter]

    constructor(public l = 6, public k = 3) { }

    probabilityMassFunction(l = this.l, k = this.k) {
        return 0;
    }

    cumulativeDistributionFunction(l = this.l, k = this.k) {
        let sum = 0;
        for (let i = 1; i <= k; i++) {
            sum += this.probabilityMassFunction(l, k);
        }
        return sum;
    }

    variance(l = this.l, k = this.k) {
        return 0;
    }
}

function permute(n: number, k: number) {
    return n! / (n - k) !
}

function choose(n: number, k: number) {
    return n! / ((n - k) ! * k!)
}