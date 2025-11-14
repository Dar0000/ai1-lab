const btnLocate = document.getElementById("btn-locate");
const btnCapture = document.getElementById("btn-capture");
const btnReset = document.getElementById("btn-reset");

const canvas = document.getElementById("mapCanvas");
const ctx = canvas.getContext("2d");

const piecesBox = document.getElementById("pieces");
const board = document.getElementById("board");

let map, mapLoaded = false;
let pieces = [];
let pieceWidth, pieceHeight;

// --------------------------------------
// NOTIFICATIONS
// --------------------------------------
Notification.requestPermission();

// --------------------------------------
// GEOLOCATION
// --------------------------------------
btnLocate.addEventListener("click", () => {
    navigator.geolocation.getCurrentPosition(showPosition, geoError);
});

function showPosition(pos) {
    const { latitude, longitude } = pos.coords;

    document.getElementById("coords").textContent =
        `Lat: ${latitude.toFixed(5)}, Lng: ${longitude.toFixed(5)}`;

    if (!map) {
        map = L.map("map").setView([latitude, longitude], 13);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19
        }).addTo(map);

        L.marker([latitude, longitude]).addTo(map)
            .bindPopup("You are here")
            .openPopup();

        mapLoaded = true;
    } else {
        map.setView([latitude, longitude], 13);
    }
}

function geoError(err) {
    alert("Cannot get location: " + err.message);
}

// --------------------------------------
// MAP TO CANVAS
// --------------------------------------
btnCapture.addEventListener("click", () => {
    if (!mapLoaded) {
        alert("Map not loaded yet!");
        return;
    }

    leafletImage(map, (err, imgCanvas) => {
        if (err) return;

        canvas.width = imgCanvas.width;
        canvas.height = imgCanvas.height;

        ctx.drawImage(imgCanvas, 0, 0);

        createPuzzle();
    });
});

// --------------------------------------
// CREATE PUZZLE PIECES
// --------------------------------------
function createPuzzle() {
    piecesBox.innerHTML = "";
    board.innerHTML = "";
    pieces = [];

    const rows = 4;
    const cols = 4;

    pieceWidth = canvas.width / cols;
    pieceHeight = canvas.height / rows;

    // make board same size as puzzle
    board.style.height = canvas.height + "px";
    board.style.gridTemplateRows = `repeat(4, ${pieceHeight}px)`;
    board.style.gridTemplateColumns = `repeat(4, ${pieceWidth}px)`;

    piecesBox.style.height = canvas.height + "px";
    piecesBox.style.gridTemplateRows = `repeat(4, ${pieceHeight}px)`;
    piecesBox.style.gridTemplateColumns = `repeat(4, ${pieceWidth}px)`;

    for (let i = 0; i < 16; i++) {
        const r = Math.floor(i / cols);
        const c = i % cols;

        const pieceCanvas = document.createElement("canvas");
        pieceCanvas.width = pieceWidth;
        pieceCanvas.height = pieceHeight;

        const pctx = pieceCanvas.getContext("2d");
        pctx.drawImage(
            canvas,
            c * pieceWidth, r * pieceHeight, pieceWidth, pieceHeight,
            0, 0, pieceWidth, pieceHeight
        );

        const img = new Image();
        img.src = pieceCanvas.toDataURL();
        img.dataset.index = i;
        img.draggable = true;

        // disappear when dragging
        img.addEventListener("dragstart", e => {
            e.dataTransfer.setData("text/plain", img.dataset.index);
            setTimeout(() => img.style.opacity = "0", 50);
        });
        img.addEventListener("dragend", () => img.style.opacity = "1");

        pieces.push(img);
    }

    // shuffle
    pieces.sort(() => Math.random() - 0.5);

    pieces.forEach(p => piecesBox.appendChild(p));

    // create 16 empty cells
    for (let i = 0; i < 16; i++) {
        const cell = document.createElement("div");

        cell.addEventListener("dragover", e => e.preventDefault());
        cell.addEventListener("drop", e => {
            e.preventDefault();

            const index = e.dataTransfer.getData("text/plain");
            const piece = piecesBox.querySelector(`img[data-index="${index}"]`);

            if (!piece) return;
            if (cell.children.length > 0) return;

            piece.style.opacity = "1";
            cell.appendChild(piece);

            checkPuzzle();
        });

        board.appendChild(cell);
    }
}

// --------------------------------------
// RESET PUZZLE
// --------------------------------------
btnReset.addEventListener("click", () => {
    piecesBox.innerHTML = "";
    board.innerHTML = "";
    pieces.forEach(p => {
        p.style.opacity = "1";
        piecesBox.appendChild(p);
    });
});

// --------------------------------------
// PUZZLE CHECK
// --------------------------------------
function checkPuzzle() {
    const cells = board.children;
    let correct = 0;
    let filled = 0;

    for (let i = 0; i < 16; i++) {
        if (cells[i].children.length === 1) {
            filled++;
            const piece = cells[i].children[0];
            if (piece.dataset.index == i) correct++;
        }
    }

    if (filled < 16) return;

    if (correct === 16) {
        alert("🎉 Puzzle completed correctly!");
        console.log("Success! Puzzle completed correctly!");
    } else {
        alert("❌ Puzzle assembled incorrectly!");
        console.log("Incorrect! The puzzle is assembled incorrectly.");
    }
}
