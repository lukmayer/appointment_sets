// app.js

document.getElementById('upload').addEventListener('change', handleFileUpload);

let currentData = null;
let resultsMinimax = null;
let resultsMaximax = null;

function deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function generateAndDisplayData() {
    displayMessage("Generating data...");
    const rows = parseInt(document.getElementById('rows').value) || 100;
    const number = parseInt(document.getElementById('number').value) || 10;
    let seed = document.getElementById('seed').value;
    if (!seed) {
        seed = Math.floor(Math.random() * 1000000);
        document.getElementById('seed').value = seed;
    }
    currentData = generateData(rows, number, 0.5, seed);
    displayGeneratedData(currentData);
    displayMessage("Data generated and displayed.");
    updateInterfaceForData();
}

function uploadAndDisplayData() {
    displayMessage("Uploading and displaying data...");
    const file = document.getElementById('upload').files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const csvData = e.target.result;
            const parsedData = parseCSV(csvData);
            if (parsedData.error) {
                displayMessage(parsedData.error);
                return;
            }
            currentData = parsedData.data;
            displayUploadedData(currentData);
            const n = parsedData.sampleSize;
            const nSlots = parsedData.uniqueSlots.length;
            displayMessage(`Data uploaded and displayed. Number of subjects (n): ${n}, Number of unique slots (nSlots): ${nSlots}`);
            updateInterfaceForData();
        };
        reader.readAsText(file);
    }
}


function parseCSV(csv) {
    const lines = csv.split('\n');
    console.log("CSV lines:", lines);

    const headers = lines[0].split(',');
    console.log("CSV headers:", headers);
    
    if (headers[0].trim().toLowerCase() !== 'subject' || headers[1].trim().toLowerCase() !== 'selections') {
        return { error: "Invalid CSV format. The first column should be 'Subject' and the second column should be 'Selections'." };
    }
    
    const result = [];
    const subjects = new Set();
    const allSelections = new Set();

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        console.log(`Processing line ${i + 1}:`, line);

        if (!line) continue;

        const columns = line.split(',');
        const subj = parseInt(columns[0].trim());
        console.log(`Subject ID: ${subj}`);

        if (isNaN(subj) || subj < 1 || subjects.has(subj)) {
            return { error: `Invalid subject ID at line ${i + 1}. IDs must be unique, positive integers starting from 1.` };
        }

        // Remove quotes and split selections
        const selectionString = columns.slice(1).join(',').replace(/['"]+/g, '');
        const selections = selectionString.split(',').map(s => s.trim()).map(Number);
        console.log(`Selections for subject ${subj}:`, selections);

        if (selections.some(isNaN)) {
            return { error: `Invalid selection values for subject ID ${subj} at line ${i + 1}. All selections must be valid integers.` };
        }

        selections.forEach(sel => allSelections.add(sel));
        subjects.add(subj);
        result.push({ subj, selections, solution: 0 });
    }

    const uniqueSlots = Array.from(allSelections);
    console.log("Unique slots:", uniqueSlots);

    return {
        data: result,
        uniqueSlots,
        sampleSize: subjects.size
    };
}




function handleFileUpload(event) {
    uploadAndDisplayData();
}

function applyAlgorithms() {
    if (!currentData) {
        displayMessage("No data available. Please generate or upload data first.");
        return;
    }

    try {
        displayMessage("Applying Minimax algorithm...");
        console.log("Applying Minimax algorithm...");
        const dataForMinimax = deepCopy(currentData);
        resultsMinimax = minimax(dataForMinimax, parseInt(document.getElementById('minm').value), parseInt(document.getElementById('maxm').value));
        console.log("Minimax algorithm applied. Results:", resultsMinimax);

        displayMessage("Applying Maximax algorithm...");
        console.log("Applying Maximax algorithm...");
        const dataForMaximax = deepCopy(currentData);
        resultsMaximax = maximax(dataForMaximax, parseInt(document.getElementById('maxm').value));
        console.log("Maximax algorithm applied. Results:", resultsMaximax);

        displayMessage("Algorithms applied.");
    } catch (error) {
        console.error("Error applying algorithms:", error);
        displayMessage("An error occurred while applying the algorithms. Check the console for details.");
    }
}

function compareResults() {
    if (!resultsMinimax || !resultsMaximax) {
        displayMessage("No results available. Please apply the algorithms first.");
        return;
    }

    try {
        const minm = parseInt(document.getElementById('minm').value);
        const maxm = parseInt(document.getElementById('maxm').value);
        const number = parseInt(document.getElementById('number').value) || 20;

        console.log("Creating Results objects for comparison...");
        const constrainedMinimax = applyConstraints(resultsMinimax.solution, minm, maxm);
        const constrainedMaximax = applyConstraints(resultsMaximax.solution, minm, maxm);

        const resultObjMinimax = calculateMetrics(constrainedMinimax, number, minm, maxm);
        const resultObjMaximax = calculateMetrics(constrainedMaximax, number, minm, maxm);

        console.log("Results objects created. Displaying results...");
        displayResults(resultObjMinimax, resultObjMaximax);
        displayMessage("Results compared and displayed.");
    } catch (error) {
        console.error("Error comparing results:", error);
        displayMessage("An error occurred while comparing the results. Check the console for details.");
    }
}

function downloadAllocations() {
    if (!resultsMinimax || !resultsMaximax) {
        displayMessage("No results available to download. Please apply the algorithms first.");
        return;
    }

    try {
        console.log("Downloading Minimax allocation...");
        const constrainedMinimax = applyConstraints(resultsMinimax.solution, parseInt(document.getElementById('minm').value), parseInt(document.getElementById('maxm').value));
        console.log("Minimax solution:", constrainedMinimax);
        if (Array.isArray(constrainedMinimax) && constrainedMinimax.length > 0) {
            downloadCSV(constrainedMinimax, 'minimax_allocation.csv');
        } else {
            console.error("No data in Minimax solution to download.");
        }

        console.log("Downloading Maximax allocation...");
        const constrainedMaximax = applyConstraints(resultsMaximax.solution, parseInt(document.getElementById('minm').value), parseInt(document.getElementById('maxm').value));
        console.log("Maximax solution:", constrainedMaximax);
        if (Array.isArray(constrainedMaximax) && constrainedMaximax.length > 0) {
            downloadCSV(constrainedMaximax, 'maximax_allocation.csv');
        } else {
            console.error("No data in Maximax solution to download.");
        }

        displayMessage("Allocations downloaded.");
    } catch (error) {
        console.error("Error downloading allocations:", error);
        displayMessage("An error occurred while downloading the allocations. Check the console for details.");
    }
}

function resetApp() {
    currentData = null;
    resultsMinimax = null;
    resultsMaximax = null;
    document.getElementById('generated-uploaded-data').innerHTML = '';
    clearResultsTable();
    document.getElementById('message').innerText = '';
    displayMessage("App reset. You can now generate or upload data.");
    enableDataInput();
}

function displayGeneratedData(data) {
    console.log("Displaying generated data...");
    const generatedDataSection = document.getElementById('generated-uploaded-data');
    generatedDataSection.innerHTML = convertDataToTable(data);
}

function displayUploadedData(data) {
    console.log("Displaying uploaded data...");
    const uploadedDataSection = document.getElementById('generated-uploaded-data');
    uploadedDataSection.innerHTML = convertDataToTable(data);
}

function convertDataToTable(data) {
    let table = "<table border='1'><tr><th>Subject</th><th>Selections</th></tr>";
    data.forEach(item => {
        table += `<tr><td>${item.subj}</td><td>${item.selections.join(', ')}</td></tr>`;
    });
    table += "</table>";
    return table;
}

function displayResults(resultObjMinimax, resultObjMaximax) {
    const minimaxFitElement = document.getElementById('minimaxFit');
    const maximaxFitElement = document.getElementById('maximaxFit');
    const minimaxKElement = document.getElementById('minimaxK');
    const maximaxKElement = document.getElementById('maximaxK');
    const minimaxMiSRElement = document.getElementById('minimaxMiSR');
    const maximaxMiSRElement = document.getElementById('maximaxMiSR');
    const minimaxMaSRElement = document.getElementById('minimaxMaSR');
    const maximaxMaSRElement = document.getElementById('maximaxMaSR');

    if (!minimaxFitElement || !maximaxFitElement || !minimaxKElement || !maximaxKElement || !minimaxMiSRElement || !maximaxMiSRElement || !minimaxMaSRElement || !maximaxMaSRElement) {
        console.error("One or more elements for displaying results are missing.");
        return;
    }

    minimaxFitElement.textContent = resultObjMinimax.fit;
    maximaxFitElement.textContent = resultObjMaximax.fit;
    minimaxKElement.textContent = resultObjMinimax.k;
    maximaxKElement.textContent = resultObjMaximax.k;
    minimaxMiSRElement.textContent = resultObjMinimax.minr;
    maximaxMiSRElement.textContent = resultObjMaximax.minr;
    minimaxMaSRElement.textContent = resultObjMinimax.maxr;
    maximaxMaSRElement.textContent = resultObjMaximax.maxr;

    console.log("Minimax Metrics:", resultObjMinimax);
    console.log("Maximax Metrics:", resultObjMaximax);
}

function clearResultsTable() {
    document.getElementById('minimaxFit').textContent = '';
    document.getElementById('maximaxFit').textContent = '';
    document.getElementById('minimaxK').textContent = '';
    document.getElementById('maximaxK').textContent = '';
    document.getElementById('minimaxMiSR').textContent = '';
    document.getElementById('maximaxMiSR').textContent = '';
    document.getElementById('minimaxMaSR').textContent = '';
    document.getElementById('maximaxMaSR').textContent = '';
}

function downloadCSV(data, filename) {
    if (!data || data.length === 0) {
        console.error("No data to download.");
        return;
    }

    const csv = data.map(row => {
        return `${row.subj},"${row.selections.join(',')}","${row.solution}"`;
    }).join('\n');
    const csvContent = "data:text/csv;charset=utf-8,subject,selections,solution\n" + csv;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function displayMessage(message) {
    const messageSection = document.getElementById('message');
    messageSection.innerText = message;
}

function updateInterfaceForData() {
    document.getElementById('upload').disabled = true;
    document.getElementById('rows').disabled = true;
    document.getElementById('number').disabled = true;
    document.getElementById('seed').disabled = true;
    document.getElementById('minm').disabled = true;
    document.getElementById('maxm').disabled = true;
    document.getElementById('generate-button').disabled = true;
    document.getElementById('upload-button').disabled = true;
    document.getElementById('uploadMinm').disabled = true;
    document.getElementById('uploadMaxm').disabled = true;
    document.querySelector('.button-group button:nth-child(4)').classList.add('reset-button');
}

function enableDataInput() {
    document.getElementById('upload').disabled = false;
    document.getElementById('rows').disabled = false;
    document.getElementById('number').disabled = false;
    document.getElementById('seed').disabled = false;
    document.getElementById('minm').disabled = false;
    document.getElementById('maxm').disabled = false;
    document.getElementById('generate-button').disabled = false;
    document.getElementById('upload-button').disabled = false;
    document.getElementById('uploadMinm').disabled = false;
    document.getElementById('uploadMaxm').disabled = false;
    document.querySelector('.button-group button:nth-child(4)').classList.remove('reset-button');
}

function showDialog(dialogId) {
    document.getElementById(dialogId).showModal();
}

function closeDialog(dialogId) {
    document.getElementById(dialogId).close();
}
