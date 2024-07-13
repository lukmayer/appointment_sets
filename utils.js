// utils.js

function allocCounts(data) {
    const allocs = {};
    data.forEach(row => {
        if (row.solution !== 0) {
            allocs[row.solution] = (allocs[row.solution] || 0) + 1;
        }
    });
    console.log("allocCounts:", allocs);
    return allocs;
}

function popDict(data, unallocated) {
    const counts = {};
    data.forEach(row => {
        if (unallocated && row.solution !== 0) return;
        row.selections.forEach(item => {
            counts[item] = (counts[item] || 0) + 1;
        });
    });
    console.log("popDict:", counts);
    return counts;
}

function minmCheck(dict, minm) {
    const result = {};
    Object.keys(dict).forEach(key => {
        if (dict[key] >= minm) result[key] = dict[key];
    });
    console.log("minmCheck:", result);
    return result;
}

function maxmCheck(allocs, dict, maxm) {
    const result = {};
    Object.keys(dict).forEach(key => {
        if (!allocs[key] || allocs[key] < maxm) result[key] = dict[key];
    });
    console.log("maxmCheck:", result);
    return result;
}

function getSubj(data, target) {
    const subjects = data.filter(row => row.solution === 0 && row.selections.includes(target)).map(row => row.subj);
    console.log("getSubj:", subjects);
    return subjects;
}

function maxNumber(allocs, target, maxm) {
    const result = allocs[target] ? Math.max(1, maxm - allocs[target]) : maxm;
    console.log("maxNumber:", result);
    return result;
}

function allocateMax(data, subjects, count, target) {
    const newData = JSON.parse(JSON.stringify(data));
    let allocated = 0;
    for (let i = 0; i < newData.length && allocated < count; i++) {
        if (subjects.includes(newData[i].subj) && newData[i].solution === 0) {
            newData[i].solution = target;
            allocated++;
        }
    }
    console.log("allocateMax:", newData);
    return newData;
}
