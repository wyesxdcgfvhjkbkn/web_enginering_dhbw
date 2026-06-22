// ===============================
// 🛒 UI SYSTEM
// ===============================

function initUI() {
    const state = window.state;
    const shopButton = document.getElementById("shopButton");
    const shopPanel  = document.getElementById("shopPanel");

    // 🛒 Shop Toggle
    shopButton.addEventListener("click", () => {
        shopPanel.classList.toggle("hidden");
    });

    // 🏗️ Tower-Drag aus dem Shop starten
    document.querySelectorAll(".shop-item").forEach(item => {
        item.addEventListener("mousedown", (e) => {
            state.selectedTower   = item.dataset.tower;
            state.isDraggingTower = true;
            shopPanel.classList.add("hidden");
            e.preventDefault();
        });
    });

    // 🌊 Welle starten
    document.getElementById("startWaveButton").addEventListener("click", () => {
        if (!state.waveRunning) startWave();
    });
}

function updateUI() {
    const {money} = window.state;
    document.getElementById("money").textContent = money;
}

function updateHP() {
    const {hp} = window.state;
    document.getElementById("hp").textContent = Math.max(0, hp);
}

function updateRound() {
    const {round} = window.state;
    document.getElementById("round").textContent = round;
}
