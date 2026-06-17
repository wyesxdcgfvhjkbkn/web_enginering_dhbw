// ===============================
// 🛒 UI SYSTEM
// ===============================

function initUI() {
    const shopButton = document.getElementById("shopButton");
    const shopPanel  = document.getElementById("shopPanel");

    // 🛒 Shop Toggle
    shopButton.addEventListener("click", () => {
        shopPanel.classList.toggle("hidden");
    });

    // 🏗️ Tower-Drag aus dem Shop starten
    document.querySelectorAll(".shop-item").forEach(item => {
        item.addEventListener("mousedown", (e) => {
            selectedTower   = item.dataset.tower;
            isDraggingTower = true;
            shopPanel.classList.add("hidden");
            e.preventDefault();
        });
    });

    // 🌊 Welle starten
    document.getElementById("startWaveButton").addEventListener("click", () => {
        if (!waveRunning) startWave();
    });
}

function updateUI() {
    document.getElementById("money").textContent = money;
}

function updateHP() {
    document.getElementById("hp").textContent = Math.max(0, hp);
}

function updateRound() {
    document.getElementById("round").textContent = round;
}
