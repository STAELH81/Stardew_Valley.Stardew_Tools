document.getElementById('calculate').addEventListener('click', function() {
    const cropSelect = document.getElementById('crop');
    const qualitySelect = document.getElementById('quality');
    const plotsInput = document.getElementById('plots');

    const selectedCrop = cropSelect.options[cropSelect.selectedIndex];

    if (!selectedCrop.value) {
        document.getElementById('result').textContent = "Veuillez sélectionner une culture.";
        return;
    }

    const cost = parseInt(selectedCrop.dataset.cost);
    let price;

    switch (qualitySelect.value) {
        case 'normal':
            price = parseInt(selectedCrop.dataset.priceNormal);
            break;
        case 'silver':
            price = parseInt(selectedCrop.dataset.priceSilver);
            break;
        case 'gold':
            price = parseInt(selectedCrop.dataset.priceGold);
            break;
        case 'iridium':
            price = parseInt(selectedCrop.dataset.priceIridium);
            break;
        default:
            price = 0;
    }

    const plots = parseInt(plotsInput.value);
    const totalCost = cost * plots;
    const totalRevenue = price * plots;
    const profit = totalRevenue - totalCost;

    const priceWithCultivator = Math.round(price * 1.10);
    const totalRevenueWithCultivator = priceWithCultivator * plots;
    const profitWithCultivator = totalRevenueWithCultivator - totalCost;

    document.getElementById('result').innerHTML = `
        Pour ${plots} case(s) de ${selectedCrop.text}, le bénéfice est de : ${Math.round(profit)}g.<br>
        Avec cultivateur : ${Math.round(profitWithCultivator)}g.
    `;
});
