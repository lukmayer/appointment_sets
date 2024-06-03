// results.js

function applyConstraints(data, min_mem, max_mem) {
    const constrainedData = JSON.parse(JSON.stringify(data));
    constrainedData.forEach(row => {
        const subs = constrainedData.filter(r => r.solution === row.solution);
        if (subs.length < min_mem || subs.length > max_mem) {
            row.solution = 0; // Set to 0 for unallocated
        }
    });
    return constrainedData;
}

function calculateMetrics(data, nslots, min_mem, max_mem) {
    const results = {
        solution: data, // This is the constrained data
        nslots: nslots,
        min_mem: min_mem,
        max_mem: max_mem,
        k: 0,
        n: 0,
        fit: 0,
        ec: 0,
        eg: 0,
        range: 0,
        q: 0,
        w: 0,
        minr: 0,
        maxr: 0,
    };

    const uniqueSolutions = [...new Set(data.map(row => row.solution))].filter(sol => sol !== 0);
    results.k = uniqueSolutions.length;
    results.n = data.length;

    const allocatedCount = data.filter(row => row.solution !== 0).length;
    const totalCapacity = results.nslots * results.max_mem;

    results.fit = allocatedCount / Math.min(results.n, totalCapacity);
    results.ec = totalCapacity >= results.n ? 1 : 0;
    results.eg = results.min_mem === results.max_mem ? 1 : 0;
    results.range = results.max_mem - results.min_mem;

    if (totalCapacity >= results.n && results.n % results.max_mem >= results.min_mem) {
        results.q = Math.ceil(results.n / results.max_mem);
    } else if (totalCapacity >= results.n && results.n % results.max_mem < results.min_mem) {
        results.q = Math.floor(results.n / results.max_mem);
    } else {
        results.q = results.nslots;
    }

    results.w = results.nslots * results.min_mem > results.n ? Math.floor(results.n / results.min_mem) : results.nslots;

    results.minr = results.fit * (1 - Math.abs(1 - (results.k / results.q)));
    results.maxr = results.k / results.w * results.fit;

    console.log("Metrics: ", {
        k: results.k,
        n: results.n,
        fit: results.fit,
        ec: results.ec,
        eg: results.eg,
        range: results.range,
        q: results.q,
        w: results.w,
        minr: results.minr,
        maxr: results.maxr
    });

    return results;
}

function createResults(data, nslots, min_mem, max_mem) {
    const constrainedData = applyConstraints(data, min_mem, max_mem);
    const results = calculateMetrics(constrainedData, nslots, min_mem, max_mem);
    return results;
}
