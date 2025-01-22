let selectedSprinkler = null;
let deleteMode = false;
let gridRows = 5;
let gridCols = 5;
let selectedLang = 'fr';

const sprinklerRanges = {
    'basic': [{x: 0, y: -1}, {x: 0, y: 1}, {x: -1, y: 0}, {x: 1, y: 0}],
    'quality': [
        {x: -1, y: -1}, {x: 0, y: -1}, {x: 1, y: -1},
        {x: -1, y: 0}, {x: 1, y: 0},
        {x: -1, y: 1}, {x: 0, y: 1}, {x: 1, y: 1}
    ],
    'iridium': [
        {x: -2, y: -2}, {x: -1, y: -2}, {x: 0, y: -2}, {x: 1, y: -2}, {x: 2, y: -2},
        {x: -2, y: -1}, {x: -1, y: -1}, {x: 0, y: -1}, {x: 1, y: -1}, {x: 2, y: -1},
        {x: -2, y: 0},  {x: -1, y: 0},                {x: 1, y: 0},  {x: 2, y: 0},
        {x: -2, y: 1},  {x: -1, y: 1},  {x: 0, y: 1},  {x: 1, y: 1},  {x: 2, y: 1},
        {x: -2, y: 2},  {x: -1, y: 2},  {x: 0, y: 2},  {x: 1, y: 2},  {x: 2, y: 2}
    ]
};

const grid = document.getElementById('grid-container');

if (!grid) {
    console.error("Le conteneur de la grille (grid-container) n'a pas été trouvé.");
}

grid.addEventListener('click', function(event) {
    const selectedType = getSelectedType();
    placeSprinkler(event, selectedType);
});

function generateGrid() {
    gridRows = document.getElementById("grid-rows").value;
    gridCols = document.getElementById("grid-cols").value;
    const gridContainer = document.getElementById("grid-container");

    gridContainer.innerHTML = '';
    gridContainer.style.gridTemplateColumns = `repeat(${gridCols}, 50px)`;

    for (let i = 0; i < gridRows * gridCols; i++) {
        const cell = document.createElement('div');
        cell.classList.add('grid-cell');
        cell.dataset.index = i;
        cell.addEventListener('click', () => handleCellClick(cell));
        gridContainer.appendChild(cell);
    }
}

function selectSprinkler(type) {
    selectedSprinkler = type;
    deleteMode = false;
    console.log("Arroseur sélectionné :", type);
    console.log("Langue actuelle :", selectedLang);
    updateMaterialCost();
}

function deleteSprinklerMode() {
    deleteMode = true;
    selectedSprinkler = null;
}

function handleCellClick(cell) {
    const index = parseInt(cell.dataset.index);
    const row = Math.floor(index / gridCols);
    const col = index % gridCols;

    if (deleteMode) {
        cell.classList.remove('sprinkler-basic', 'sprinkler-quality', 'sprinkler-iridium');
        cell.style.backgroundImage = "url('dirt.png')";
        clearHighlightRange();
    } else if (selectedSprinkler) {
        cell.classList.add(`sprinkler-${selectedSprinkler}`);
        cell.style.backgroundImage = `url('${selectedSprinkler}-sprinkler.png')`;
        highlightRange(row, col, selectedSprinkler);
    } else {
        alert("Veuillez sélectionner un arroseur avant de placer un élément.");
    }
}

function highlightRange(row, col, type) {
    clearHighlightRange();
    const range = sprinklerRanges[type];
    
    range.forEach(offset => {
        const targetRow = row + offset.y;
        const targetCol = col + offset.x;
        if (targetRow >= 0 && targetRow < gridRows && targetCol >= 0 && targetCol < gridCols) {
            const targetIndex = targetRow * gridCols + targetCol;
            const targetCell = document.querySelector(`.grid-cell[data-index="${targetIndex}"]`);
            if (targetCell) {
                targetCell.classList.add('irrigated');
            }
        }
    });
}

function clearHighlightRange() {
    document.querySelectorAll('.highlight-range').forEach(cell => {
        cell.classList.remove('highlight-range');
    });
}

let basicCount = 0;
let qualityCount = 0;
let iridiumCount = 0;

function updateMaterialCosts() {
    const basicCopperBars = basicCount * 1;
    const basicIronBars = basicCount * 1;
    const qualityIronBars = qualityCount * 1;
    const qualityGoldBars = qualityCount * 1;
    const qualityQuartz = qualityCount * 1;
    const iridiumGoldBars = iridiumCount * 1;
    const iridiumBars = iridiumCount * 1;
    const batteries = iridiumCount * 1;

    function updateMaterialCost() {
        const materialsList = document.getElementById('materials-list');
    
        materialsList.children[0].textContent = `${translations[selectedLang].basicCost} ${basicCount} ${translations[selectedLang].copperBar}, ${basicCount} ${translations[selectedLang].ironBar}`;
        materialsList.children[1].textContent = `${translations[selectedLang].qualityCost} ${qualityCount} ${translations[selectedLang].ironBar}, ${qualityCount} ${translations[selectedLang].goldBar}, ${qualityCount} ${translations[selectedLang].quartz}`;
        materialsList.children[2].textContent = `${translations[selectedLang].iridiumCost} ${iridiumCount} ${translations[selectedLang].goldBar}, ${iridiumCount} ${translations[selectedLang].iridiumBar}, ${iridiumCount} ${translations[selectedLang].battery}`;
    }
    

    document.getElementById('materials-list').innerHTML = `
        <li>Arroseur Basique : ${basicCopperBars} lingots de cuivre, ${basicIronBars} lingots de fer</li>
        <li>Arroseur de Qualité : ${qualityIronBars} lingots de fer, ${qualityGoldBars} lingots d'or, ${qualityQuartz} quartz raffiné</li>
        <li>Arroseur Iridium : ${iridiumGoldBars} lingots d'or, ${iridiumBars} lingots d'iridium, ${batteries} piles</li>
    `;
}

function handleCellClick(cell) {
    const index = parseInt(cell.dataset.index);
    const row = Math.floor(index / gridCols);
    const col = index % gridCols;

    if (deleteMode) {
        if (cell.classList.contains('sprinkler-basic')) {
            basicCount--;
            resetIrrigatedCells(row, col, 'basic');
        } else if (cell.classList.contains('sprinkler-quality')) {
            qualityCount--;
            resetIrrigatedCells(row, col, 'quality');
        } else if (cell.classList.contains('sprinkler-iridium')) {
            iridiumCount--;
            resetIrrigatedCells(row, col, 'iridium');
        }

        cell.classList.remove('sprinkler-basic', 'sprinkler-quality', 'sprinkler-iridium');
        cell.style.backgroundImage = "url('dirt.png')";
        clearHighlightRange();
        updateMaterialCosts();
    } else if (selectedSprinkler) {
        cell.classList.add(`sprinkler-${selectedSprinkler}`);
        cell.style.backgroundImage = `url('${selectedSprinkler}-sprinkler.png')`;
        highlightRange(row, col, selectedSprinkler);
        if (selectedSprinkler === 'basic') {
            basicCount++;
        } else if (selectedSprinkler === 'quality') {
            qualityCount++;
        } else if (selectedSprinkler === 'iridium') {
            iridiumCount++;
        }
        updateMaterialCosts();
    } else {
        alert("Veuillez sélectionner un arroseur avant de placer un élément.");
    }
}

function resetIrrigatedCells(row, col, type) {
    const range = sprinklerRanges[type];
    
    range.forEach(offset => {
        const targetRow = row + offset.y;
        const targetCol = col + offset.x;
        if (targetRow >= 0 && targetRow < gridRows && targetCol >= 0 && targetCol < gridCols) {
            const targetIndex = targetRow * gridCols + targetCol;
            const targetCell = document.querySelector(`.grid-cell[data-index="${targetIndex}"]`);
            if (targetCell) {
                targetCell.classList.remove('irrigated');
                targetCell.style.backgroundImage = "url('dirt.png')";
            }
        }
    });
}

const translations = {
    fr: {
        basic: "Arroseur Basique",
        quality: "Arroseur de Qualité",
        iridium: "Arroseur Iridium",
        delete: "Mode Suppression",
        materials: "Coût des Matériaux",
        basicCost: "Arroseur Basique :",
        qualityCost: "Arroseur de Qualité :",
        iridiumCost: "Arroseur Iridium :",
        rows: "Lignes",
        cols: "Colonnes",
        generateGrid: "Générer la Grille",
        copperBar: "lingots de cuivre",
        ironBar: "lingots de fer",
        goldBar: "lingots d'or",
        iridiumBar: "lingots d'iridium",
        quartz: "quartz raffiné",
        battery: "pile"
    },
    en: {
        basic: "Basic Sprinkler",
        quality: "Quality Sprinkler",
        iridium: "Iridium Sprinkler",
        delete: "Delete Mode",
        materials: "Material Cost",
        basicCost: "Basic Sprinkler:",
        qualityCost: "Quality Sprinkler:",
        iridiumCost: "Iridium Sprinkler:",
        rows: "Rows",
        cols: "Columns",
        generateGrid: "Generate Grid",
        copperBar: "copper bars",
        ironBar: "iron bars",
        goldBar: "gold bars",
        iridiumBar: "iridium bars",
        quartz: "refined quartz",
        battery: "battery"
    }
};


function changeLanguage() {
    const selectedLang = document.getElementById('language-select').value;
    document.querySelector('button[onclick="selectSprinkler(\'basic\')"]').textContent = translations[selectedLang].basic;
    document.querySelector('button[onclick="selectSprinkler(\'quality\')"]').textContent = translations[selectedLang].quality;
    document.querySelector('button[onclick="selectSprinkler(\'iridium\')"]').textContent = translations[selectedLang].iridium;
    document.querySelector('button[onclick="deleteSprinklerMode()"]').textContent = translations[selectedLang].delete;
    document.querySelector('.materials-cost h3').textContent = translations[selectedLang].materials;
    document.getElementById('label-rows').textContent = translations[selectedLang].rows + ":";
    document.getElementById('label-cols').textContent = translations[selectedLang].cols + ":";
    document.getElementById('generate-grid-button').textContent = translations[selectedLang].generateGrid;
    const materialsList = document.getElementById('materials-list');
    materialsList.children[0].textContent = translations[selectedLang].basicCost + ' ' + basicCount + ' ' + translations[selectedLang].copperBar + ', ' + basicCount + ' ' + translations[selectedLang].ironBar;
    materialsList.children[1].textContent = translations[selectedLang].qualityCost + ' ' + qualityCount + ' ' + translations[selectedLang].ironBar + ', ' + qualityCount + ' ' + translations[selectedLang].goldBar + ', ' + qualityCount + ' ' + translations[selectedLang].quartz;
    materialsList.children[2].textContent = translations[selectedLang].iridiumCost + ' ' + iridiumCount + ' ' + translations[selectedLang].goldBar + ', ' + iridiumCount + ' ' + translations[selectedLang].iridiumBar + ', ' + iridiumCount + ' ' + translations[selectedLang].battery;
}

window.onload = function() {
    changeLanguage();
};

console.log("Langue sélectionnée :", selectedLang);
console.log("Titre mis à jour :", translations[selectedLang].title);

function updateMaterialCost() {
    const materialsList = document.getElementById('materials-list');
    materialsList.children[0].textContent = `${translations[selectedLang].basicCost}: ${basicCount} ${translations[selectedLang].copperBar}, ${basicCount} ${translations[selectedLang].ironBar}`;
    materialsList.children[1].textContent = `${translations[selectedLang].qualityCost}: ${qualityCount} ${translations[selectedLang].ironBar}, ${qualityCount} ${translations[selectedLang].goldBar}, ${qualityCount} ${translations[selectedLang].quartz}`;
    materialsList.children[2].textContent = `${translations[selectedLang].iridiumCost}: ${iridiumCount} ${translations[selectedLang].goldBar}, ${iridiumCount} ${translations[selectedLang].iridiumBar}, ${iridiumCount} ${translations[selectedLang].battery}`;
}

grid.addEventListener('click', function(event) {
    const selectedType = getSelectedType();
    placeSprinkler(event, selectedType);
});

function placeSprinkler(event, type) {
    updateMaterialCost();
}

function updateMaterialCost() {
    console.log("Langue actuelle dans updateMaterialCost :", selectedLang);
    const materialsList = document.getElementById('materials-list');
    materialsList.children[0].textContent = `${translations[selectedLang].basicCost}: ${basicCount} ${translations[selectedLang].copperBar}, ${basicCount} ${translations[selectedLang].ironBar}`;
    materialsList.children[1].textContent = `${translations[selectedLang].qualityCost}: ${qualityCount} ${translations[selectedLang].ironBar}, ${qualityCount} ${translations[selectedLang].goldBar}, ${qualityCount} ${translations[selectedLang].quartz}`;
    materialsList.children[2].textContent = `${translations[selectedLang].iridiumCost}: ${iridiumCount} ${translations[selectedLang].goldBar}, ${iridiumCount} ${translations[selectedLang].iridiumBar}, ${iridiumCount} ${translations[selectedLang].battery}`;
}

grid.addEventListener('click', function(event) {
    console.log("Clic détecté sur la grille");
    console.log("Langue actuelle avant le placement :", selectedLang);
    const selectedType = getSelectedType();
    placeSprinkler(event, selectedType);
    console.log("Langue actuelle après le placement :", selectedLang);
});

document.getElementById('themeToggle').addEventListener('click', toggleTheme);

document.addEventListener('DOMContentLoaded', function() {
    const themeToggleButton = document.getElementById('themeToggle');
    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', toggleTheme);
    } else {
        console.error("Le bouton de changement de thème (themeToggle) n'a pas été trouvé.");
    }
});

function toggleTheme() {
    document.body.classList.toggle('dark-theme');
}
