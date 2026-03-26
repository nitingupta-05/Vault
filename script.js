const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz3g6Qvgg2tFqhb2JkTj8BVPjmH24N1Se-oJDJnTk-m333kKJEOmDS6IY19VhRN1z_GtQ/exec";

const fileDatabase = [
    { id: 1, title: "Java Practical List", author: "Nitin", description: "All practical codes.", url: "files/Java Practical List.pdf" },
    { id: 2, title: "Java Algo-Flow", author: "Nitin", description: "Flowcharts and Algos.", url: "files/Java Nitin Algo Flow.pdf" },
    { id: 1, title: "Java Practical List", author: "Khushi", description: "All practical codes.", url: "files/khushi java pract.docx" },
    { id: 2, title: "Java Algo-Flow", author: "Khushi", description: "Flowcharts and Algos.", url: "files/JAVA KHUSHI ALGO-FLOW.pdf" }
];

let sequence = [];
let userSequence = [];
let isPlaying = false;
let attempts = 0;
const puzzleColors = ['red', 'blue', 'green', 'yellow'];

function initiatePuzzleStage() {
    const name = document.getElementById('user-name').value;
    if (!name.trim()) return alert("Please enter your name.");
    localStorage.setItem('vault_user', name);
    document.getElementById('entrance-stage').classList.add('hidden');
    document.getElementById('puzzle-stage').classList.remove('hidden');
    generateNewSequence();
}

function generateNewSequence() {
    sequence = Array.from({length: 4}, () => Math.floor(Math.random() * 4));
    setTimeout(playSequence, 800);
}

function playSequence() {
    if (isPlaying) return;
    isPlaying = true;
    userSequence = [];
    let i = 0;
    const interval = setInterval(() => {
        flash(sequence[i]);
        i++;
        if (i >= sequence.length) { clearInterval(interval); isPlaying = false; }
    }, 800);
}

function flash(index) {
    const el = document.querySelector(`.shape.${puzzleColors[index]}`);
    el.classList.add('active-flash');
    setTimeout(() => el.classList.remove('active-flash'), 400);
}

function handleUserClick(index) {
    if (isPlaying) return;
    userSequence.push(index);
    flash(index);
    if (userSequence[userSequence.length-1] !== sequence[userSequence.length-1]) {
        attempts++;
        alert("Try again!");
        generateNewSequence();
        return;
    }
    if (userSequence.length === sequence.length) {
        finalizeData();
        unlockVault();
    }
}

async function finalizeData() {
    const log = {
        name: localStorage.getItem('vault_user'),
        puzzleAttempts: attempts + 1,
        status: "Authorized"
    };
    // Send as text/plain to avoid CORS pre-flight block
    fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify(log)
    });
}

function unlockVault() {
    document.getElementById('puzzle-stage').classList.add('hidden');
    document.getElementById('vault-stage').classList.remove('hidden');
    document.getElementById('greeting').innerText = `Welcome to the Vault, ${localStorage.getItem('vault_user')}!`;
    
    const grid = document.getElementById('file-grid');
    grid.innerHTML = ''; // Clear grid to prevent duplicates

    fileDatabase.forEach(file => {
        const div = document.createElement('div');
        div.className = 'file-card';
        div.innerHTML = `<h4>${file.title}</h4><p>${file.description}</p><p><em>By: ${file.author}</em></p>`;
        
        div.onclick = () => {
            let displayUrl = file.url;

            // Check if the file is a Word Document
            if (file.url.toLowerCase().endsWith('.docx') || file.url.toLowerCase().endsWith('.doc')) {
                // Encode the URL and wrap it in Google's Viewer
                displayUrl = `https://docs.google.com/gview?url=${encodeURIComponent(window.location.origin + '/' + file.url)}&embedded=true`;
            }

            const viewer = document.getElementById('pdf-viewer');
            viewer.src = displayUrl;
            viewer.style.display = 'block';
            
            document.querySelector('.placeholder-text').style.display = 'none';
            document.getElementById('download-link').href = file.url;
            document.getElementById('download-link').classList.remove('hidden');
        };
        grid.appendChild(div);
    });
}