import { db, getStorage, setDoc, doc, uploadString, getDownloadURL, ref } from './firebaseConfig.js';
let nameColumnIndex = -1; // Global variable for the "Name" column index

document.getElementById('csvFileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const contents = e.target.result;
        const rows = contents.split('\n').map(row => row.split(','));

        displayCSV(rows);
        populateDatalist(rows);
    };
    reader.readAsText(file);
});

function displayCSV(rows) {
    let tableHtml = '<table><tr>';

    const headers = rows[0].map(header => header.trim());
    const hasSubmittedColumn = headers.includes('Submitted Assignment');

    tableHtml += headers.map(cell => `<th>${cell}</th>`).join('');
    if (!hasSubmittedColumn) {
        tableHtml += '<th>Submitted Assignment</th>';
    }
    tableHtml += '</tr>';

    rows.slice(1).forEach((row, index) => {
        if (row.length > 1) {
            // Construct table row cells
            const cells = row.map((cell, i) => {
                // If the column is "Submitted Assignment", handle it differently
                if (headers[i] === 'Submitted Assignment') {
                    return `<td class="assignmentSubmission">${cell.trim()}</td>`;
                }
                return `<td>${cell.trim()}</td>`;
            }).join('');
            
            // Add the "Submitted Assignment" column if needed
            const submissionStatus = hasSubmittedColumn ? '' : '<td class="assignmentSubmission">No</td>';

            tableHtml += `<tr id="row-${index}">${cells}${submissionStatus}</tr>`;
        }
    });

    document.getElementById('csvTable').innerHTML = tableHtml;
    document.querySelectorAll('.assignmentSubmission').forEach(cell => {
        if (cell.textContent.trim().toLowerCase() === 'no') {
            cell.style.background = 'red';
        } else {
            cell.style.background = 'green';
        }
    });
}

function populateDatalist(rows) {
    nameColumnIndex = rows[0].map(header => header.trim().toLowerCase()).indexOf('name');
    
    if (nameColumnIndex === -1) {
        alert('The "Name" column is not found in the CSV.');
        return;
    }

    const datalist = document.getElementById('nameSearch');
    datalist.innerHTML = '';

    rows.slice(1).forEach(row => {
        if (row.length > 1) {
            const name = row[nameColumnIndex]?.trim();
            if (name) {
                datalist.innerHTML += `<option value="${name}">`;
            }
        }
    });
}

function markAsSubmitted() {
    if (nameColumnIndex === -1) {
        alert('The "Name" column is not found in the CSV.');
        return;
    }

    const searchValue = document.getElementById('searchInput').value.trim().toLowerCase();
    if (!searchValue) {
        alert('Please enter a name to search.');
        return;
    }

    let found = false;
    document.querySelectorAll('#csvTable table tr').forEach(row => {
        const cells = row.getElementsByTagName('td');
        if (cells.length > 0 && cells[nameColumnIndex].textContent.trim().toLowerCase() === searchValue) {
            const submissionCell = cells[cells.length - 1];
            submissionCell.textContent = 'Yes';
            submissionCell.style.background = 'green';
            found = true;
        }
    });

    if (!found) alert('Name not found in the table.');
}

function displayNonSubmitters() {
    const table = document.querySelector('#csvTable table');
    if (!table) return;

    const nonSubmitters = [];
    table.querySelectorAll('tr').forEach(row => {
        const cells = row.getElementsByTagName('td');
        if (cells.length > 0) {
            const name = cells[nameColumnIndex]?.textContent.trim();
            const submissionStatus = cells[cells.length - 1]?.textContent.trim();
            if (submissionStatus === 'No') {
                nonSubmitters.push(name);
            }
        }
    });

    const nonSubmittersContainer = document.getElementById('nonSubmitters');
    nonSubmittersContainer.innerHTML = nonSubmitters.length > 0
        ? `<ul>${nonSubmitters.map(name => `<li>${name}</li>`).join('')}</ul>`
        : 'All assignments have been submitted.';
}

function saveCSVToStorage() {
    const subName = document.getElementById('subjectHeading').textContent
        .toLowerCase()
        .replaceAll(/\s/g, '');

    const csvData = tableToCSV();
    const storage = getStorage();
    const fileRef = ref(storage, `submissions/${subName}/data.csv`);

    console.log('Uploading CSV data...');
    uploadString(fileRef, csvData)
        .then(() => {
            alert('CSV file uploaded successfully!');
            return getDownloadURL(fileRef);
        })
        .then((url) => {
            console.log('File available at:', url);
            saveFileUrlToFirestore(subName, url);
        })
        .catch((error) => {
            console.log('Error uploading CSV file:', error.message);
            console.error('Error code:', error.code);
            console.error('Error details:', error);
        });
}

function tableToCSV() {
    const rows = document.querySelectorAll('#csvTable table tr');
    let csvContent = '';

    rows.forEach(row => {
        const cells = row.querySelectorAll('td, th');
        const rowArray = Array.from(cells).map(cell => cell.textContent.trim());
        csvContent += rowArray.join(',') + '\n';
    });

    return csvContent;
}

function saveFileUrlToFirestore(subName, url) {
    setDoc(doc(db, `submissions/${subName}`), { url })
        .then(() => console.log('File URL saved to Firestore successfully!'))
        .catch((error) => console.error('Error saving file URL to Firestore:', error));
}

function displaySubjectName() {
    document.getElementById('subjectHeading').textContent = document.getElementById('subject').value;
}

document.getElementById('saveCSVButton').addEventListener('click', saveCSVToStorage);
export { markAsSubmitted, displayNonSubmitters, displaySubjectName };
