// algos.js

function minimax(data, minm, maxm) {
    console.log("Starting Minimax algorithm...");
    let df2 = deepCopy(data);
    df2.forEach(row => row.solution = 0); // Set initial solution to 0 (unallocated)
    console.log("Initial df2:", df2);

    try {
        while (df2.some(row => row.solution === 0)) {
            let allocs = allocCounts(df2);
            let dic1 = popDict(df2, true);
            let dic2 = minmCheck(dic1, minm);
            if (Object.keys(dic2).length === 0) dic2 = dic1;
            console.log("dic2 after minmCheck or fallback:", dic2);
            let dic3 = maxmCheck(allocs, dic2, maxm);
            if (Object.keys(dic3).length === 0) dic3 = dic2;
            console.log("dic3 after maxmCheck or fallback:", dic3);
            let target = Object.keys(dic3)[0];
            console.log("Target selected:", target);
            let res = getSubj(df2, parseInt(target));
            console.log("Subjects to allocate:", res);
            let count = maxNumber(allocs, parseInt(target), maxm);
            console.log("Number of subjects to allocate:", count);
            df2 = allocateMax(df2, res, count, parseInt(target));
            console.log("Updated df2 after allocation:", df2);
        }
        console.log("Minimax algorithm completed. Results:", df2);
    } catch (error) {
        console.error("Error in Minimax algorithm:", error);
    }
    return { solution: df2 };
}

function maximax(data, maxm) {
    console.log("Starting Maximax algorithm...");
    let df2 = deepCopy(data);
    df2.forEach(row => row.solution = 0); // Set initial solution to 0 (unallocated)
    console.log("Initial df2:", df2);

    try {
        while (df2.some(row => row.solution === 0)) {
            let allocs = allocCounts(df2);
            let dic1 = popDict(df2, true);
            let dic3 = maxmCheck(allocs, dic1, maxm);
            if (Object.keys(dic3).length === 0) dic3 = dic1;
            console.log("dic3 after maxmCheck or fallback:", dic3);
            let target = Object.keys(dic3)[0];
            console.log("Target selected:", target);
            let res = getSubj(df2, parseInt(target));
            console.log("Subjects to allocate:", res);
            let count = maxNumber(allocs, parseInt(target), maxm);
            console.log("Number of subjects to allocate:", count);
            df2 = allocateMax(df2, res, count, parseInt(target));
            console.log("Updated df2 after allocation:", df2);
        }
        console.log("Maximax algorithm completed. Results:", df2);
    } catch (error) {
        console.error("Error in Maximax algorithm:", error);
    }
    return { solution: df2 };
}

