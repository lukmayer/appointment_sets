// dataGeneration.js

function generateData(rows, number, skew = 0.5, seed = 111) {
    console.log("Generating data...");
    const slots = Array.from({ length: number }, (_, i) => i + 1);
    const subjects = Array.from({ length: rows }, (_, i) => i + 1);

    function getBinomialProbs(number, skew) {
        const probs = [];
        for (let p = 1; p <= number; p++) {
            probs.push(jStat.binomial.pdf(p, number, skew));
        }
        const normedProbs = probs.map(prob => prob / probs.reduce((a, b) => a + b, 0));
        return normedProbs;
    }

    const normedProbs = getBinomialProbs(number, skew);

    function weightedRandomChoice(array, weights) {
        const cumulativeWeights = [];
        for (let i = 0; i < weights.length; i++) {
            cumulativeWeights[i] = weights[i] + (cumulativeWeights[i - 1] || 0);
        }
        const random = Math.random() * cumulativeWeights[cumulativeWeights.length - 1];
        for (let i = 0; i < cumulativeWeights.length; i++) {
            if (random < cumulativeWeights[i]) {
                return array[i];
            }
        }
    }

    function randomChoice(array, count, probs = null) {
        const result = [];
        const availableSlots = array.slice();
        for (let i = 0; i < count; i++) {
            if (probs) {
                const choice = weightedRandomChoice(availableSlots, probs);
                result.push(choice);
                availableSlots.splice(availableSlots.indexOf(choice), 1);
            } else {
                const randomIndex = Math.floor(Math.random() * availableSlots.length);
                result.push(availableSlots[randomIndex]);
                availableSlots.splice(randomIndex, 1);
            }
        }
        return result;
    }

    const data = subjects.map((subj, i) => {
        Math.seedrandom(seed + i);
        const numberOfSelections = Math.floor(Math.random() * slots.length) + 1;
        const selections = randomChoice(slots, numberOfSelections);
        return { subj, selections };
    });

    console.log("Generated data:", data);
    return data;
}
