let selectedSprinkler = null;
let deleteMode = false;  // Mode de suppression activé ou non
let gridRows = 5;
let gridCols = 5;
let selectedLang = 'fr'; // Par défaut, langue française

const sprinklerRanges = {
    'basic': [{x: 0, y: -1}, {x: 0, y: 1}, {x: -1, y: 0}, {x: 1, y: 0}], // Portée de l'arroseur simple
    'quality': [ // Portée de l'arroseur de qualité
        {x: -1, y: -1}, {x: 0, y: -1}, {x: 1, y: -1},
        {x: -1, y: 0}, {x: 1, y: 0},
        {x: -1, y: 1}, {x: 0, y: 1}, {x: 1, y: 1}
    ],
    'iridium': [ // Portée de l'arroseur iridium
        {x: -2, y: -2}, {x: -1, y: -2}, {x: 0, y: -2}, {x: 1, y: -2}, {x: 2, y: -2},
        {x: -2, y: -1}, {x: -1, y: -1}, {x: 0, y: -1}, {x: 1, y: -1}, {x: 2, y: -1},
        {x: -2, y: 0},  {x: -1, y: 0},                {x: 1, y: 0},  {x: 2, y: 0},
        {x: -2, y: 1},  {x: -1, y: 1},  {x: 0, y: 1},  {x: 1, y: 1},  {x: 2, y: 1},
        {x: -2, y: 2},  {x: -1, y: 2},  {x: 0, y: 2},  {x: 1, y: 2},  {x: 2, y: 2}
    ]
};

// Définir la variable pour la grille
const grid = document.getElementById('grid-container');

// Assurez-vous que l'élément existe
if (!grid) {
    console.error("Le conteneur de la grille (grid-container) n'a pas été trouvé.");
}

// Écoutez l'événement de clic sur la grille
grid.addEventListener('click', function(event) {
    const selectedType = getSelectedType(); // Récupère le type d'arroseur ou autre
    placeSprinkler(event, selectedType);
});


// Générer la grille
function generateGrid() {
    gridRows = document.getElementById("grid-rows").value;
    gridCols = document.getElementById("grid-cols").value;
    const gridContainer = document.getElementById("grid-container");

    gridContainer.innerHTML = ''; // Vider la grille existante
    gridContainer.style.gridTemplateColumns = `repeat(${gridCols}, 50px)`; // Redimensionner les colonnes

    for (let i = 0; i < gridRows * gridCols; i++) {
        const cell = document.createElement('div');
        cell.classList.add('grid-cell');
        cell.dataset.index = i;
        cell.addEventListener('click', () => handleCellClick(cell));
        gridContainer.appendChild(cell);
    }
}

// Sélection de l'arroseur
function selectSprinkler(type) {
    selectedSprinkler = type;
    deleteMode = false;  // Désactive le mode suppression si un arroseur est sélectionné
    console.log("Arroseur sélectionné :", type);
    console.log("Langue actuelle :", selectedLang);

    // ... code pour sélectionner l'arroseur ...
    updateMaterialCost();
}

// Activer le mode suppression
function deleteSprinklerMode() {
    deleteMode = true;
    selectedSprinkler = null;  // Désactive la sélection d'arroseur
}

function handleCellClick(cell) {
    const index = parseInt(cell.dataset.index);
    const row = Math.floor(index / gridCols);
    const col = index % gridCols;

    if (deleteMode) {
        // Supprimer un arroseur
        cell.classList.remove('sprinkler-basic', 'sprinkler-quality', 'sprinkler-iridium');
        cell.style.backgroundImage = "url('dirt.png')"; // Revenir à l'état de sol non irrigué
        clearHighlightRange();  // Enlever la surbrillance des autres cellules
    } else if (selectedSprinkler) {
        // Appliquer l'image de l'arroseur seulement à la cellule cliquée
        cell.classList.add(`sprinkler-${selectedSprinkler}`);
        cell.style.backgroundImage = `url('${selectedSprinkler}-sprinkler.png')`;

        // Marquer les autres cellules dans la portée sans changer l'image d'arroseur
        highlightRange(row, col, selectedSprinkler);

    } else {
        alert("Veuillez sélectionner un arroseur avant de placer un élément.");
    }
}

// Afficher la portée d'un arroseur
function highlightRange(row, col, type) {
    clearHighlightRange();  // Enlever toute surbrillance précédente
    const range = sprinklerRanges[type];
    
    range.forEach(offset => {
        const targetRow = row + offset.y;
        const targetCol = col + offset.x;
        if (targetRow >= 0 && targetRow < gridRows && targetCol >= 0 && targetCol < gridCols) {
            const targetIndex = targetRow * gridCols + targetCol;
            const targetCell = document.querySelector(`.grid-cell[data-index="${targetIndex}"]`);
            if (targetCell) {
                // Appliquer l'état "irrigated" à chaque cellule dans la portée
                targetCell.classList.add('irrigated');
            }
        }
    });
}


// Enlever la surbrillance des cellules dans la portée
function clearHighlightRange() {
    document.querySelectorAll('.highlight-range').forEach(cell => {
        cell.classList.remove('highlight-range');
    });
}

let basicCount = 0;
let qualityCount = 0;
let iridiumCount = 0;

function updateMaterialCosts() {
    const basicCopperBars = basicCount * 1;  // 1 Lingot de cuivre par arroseur basique
    const basicIronBars = basicCount * 1;    // 1 Lingot de fer par arroseur basique
    
    const qualityIronBars = qualityCount * 1;   // 1 Lingot de fer par arroseur de qualité
    const qualityGoldBars = qualityCount * 1;   // 1 Lingot d'or par arroseur de qualité
    const qualityQuartz = qualityCount * 1;     // 1 Quartz raffiné par arroseur de qualité
    
    const iridiumGoldBars = iridiumCount * 1;   // 1 Lingot d'or par arroseur iridium
    const iridiumBars = iridiumCount * 1;       // 1 Lingot d'iridium par arroseur iridium
    const batteries = iridiumCount * 1;         // 1 Pile par arroseur iridium

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
        // Supprimer un arroseur et réinitialiser les cases autour
        if (cell.classList.contains('sprinkler-basic')) {
            basicCount--;
            resetIrrigatedCells(row, col, 'basic'); // Réinitialiser les cases irrigées
        } else if (cell.classList.contains('sprinkler-quality')) {
            qualityCount--;
            resetIrrigatedCells(row, col, 'quality');
        } else if (cell.classList.contains('sprinkler-iridium')) {
            iridiumCount--;
            resetIrrigatedCells(row, col, 'iridium');
        }

        cell.classList.remove('sprinkler-basic', 'sprinkler-quality', 'sprinkler-iridium');
        cell.style.backgroundImage = "url('dirt.png')"; // Revenir à l'état de sol non irrigué
        clearHighlightRange(); // Supprimer la surbrillance
        updateMaterialCosts(); // Mettre à jour les coûts après suppression
    } else if (selectedSprinkler) {
        // Ajouter l'arroseur sélectionné à la cellule cible
        cell.classList.add(`sprinkler-${selectedSprinkler}`);
        cell.style.backgroundImage = `url('${selectedSprinkler}-sprinkler.png')`;

        // Marquer les autres cellules dans la portée comme irriguées
        highlightRange(row, col, selectedSprinkler);

        // Mettre à jour le nombre d'arroseurs placés
        if (selectedSprinkler === 'basic') {
            basicCount++;
        } else if (selectedSprinkler === 'quality') {
            qualityCount++;
        } else if (selectedSprinkler === 'iridium') {
            iridiumCount++;
        }

        // Mettre à jour le coût des matériaux
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
                // Réinitialiser la cellule comme non irriguée (terre sèche)
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

    // Mettre à jour les textes avec la langue choisie
    document.querySelector('button[onclick="selectSprinkler(\'basic\')"]').textContent = translations[selectedLang].basic;
    document.querySelector('button[onclick="selectSprinkler(\'quality\')"]').textContent = translations[selectedLang].quality;
    document.querySelector('button[onclick="selectSprinkler(\'iridium\')"]').textContent = translations[selectedLang].iridium;
    document.querySelector('button[onclick="deleteSprinklerMode()"]').textContent = translations[selectedLang].delete;
    document.querySelector('.materials-cost h3').textContent = translations[selectedLang].materials;

    // Mettre à jour les labels et le bouton de génération de la grille
    document.getElementById('label-rows').textContent = translations[selectedLang].rows + ":";
    document.getElementById('label-cols').textContent = translations[selectedLang].cols + ":";
    document.getElementById('generate-grid-button').textContent = translations[selectedLang].generateGrid;

    // Mettre à jour la section des matériaux
    const materialsList = document.getElementById('materials-list');
    materialsList.children[0].textContent = translations[selectedLang].basicCost + ' ' + basicCount + ' ' + translations[selectedLang].copperBar + ', ' + basicCount + ' ' + translations[selectedLang].ironBar;
    materialsList.children[1].textContent = translations[selectedLang].qualityCost + ' ' + qualityCount + ' ' + translations[selectedLang].ironBar + ', ' + qualityCount + ' ' + translations[selectedLang].goldBar + ', ' + qualityCount + ' ' + translations[selectedLang].quartz;
    materialsList.children[2].textContent = translations[selectedLang].iridiumCost + ' ' + iridiumCount + ' ' + translations[selectedLang].goldBar + ', ' + iridiumCount + ' ' + translations[selectedLang].iridiumBar + ', ' + iridiumCount + ' ' + translations[selectedLang].battery;
}

window.onload = function() {
    changeLanguage(); // Par défaut en Français
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
    const selectedType = getSelectedType(); // Récupère le type d'arroseur ou autre
    placeSprinkler(event, selectedType);
});

function placeSprinkler(event, type) {
    // Logique pour placer l'arroseur...
    
    updateMaterialCost(); // Appelle juste pour mettre à jour les coûts
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
    
    const selectedType = getSelectedType(); // Récupère le type d'arroseur ou autre
    placeSprinkler(event, selectedType);
    
    console.log("Langue actuelle après le placement :", selectedLang);
});

// Ajouter un événement pour le bouton de changement de thème
document.getElementById('themeToggle').addEventListener('click', toggleTheme);

// Attendre que le DOM soit entièrement chargé
document.addEventListener('DOMContentLoaded', function() {
    const themeToggleButton = document.getElementById('themeToggle');
    
    // Vérifier si le bouton existe
    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', toggleTheme);
    } else {
        console.error("Le bouton de changement de thème (themeToggle) n'a pas été trouvé.");
    }
});

// Fonction pour basculer entre le mode clair et sombre
function toggleTheme() {
    document.body.classList.toggle('dark-theme'); // Ajoute/enlève la classe 'dark-theme'
}
