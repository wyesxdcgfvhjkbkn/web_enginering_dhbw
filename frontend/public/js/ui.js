// ===============================
// 🛒 UI SYSTEM
// ===============================

function initUI() {
    const state = window.state;
    const shopButton = document.getElementById("shopButton");
    const shopPanel  = document.getElementById("shopPanel");

    
    if (!shopButton || !shopPanel) {
        console.error("UI nicht gefunden!");
        return;
    }

    // 🛒 Shop Toggle
    shopButton.onclick = null;

    shopButton.onclick = () => {
        shopPanel.classList.toggle("hidden");
     };

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

    // Game Over Knöpfe
    
    const saveBtn = document.getElementById("saveScoreBtn");
    const restartBtn = document.getElementById("restartBtn");

    if (saveBtn) {
        saveBtn.onclick = () => {
            const score = state.money;

            fetch("http://localhost:3000/highscore", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                user: "TestUser", // später dynamisch!
                score: score,
            }),
            });

            alert("Highscore gespeichert!");
        };
    }

    if (restartBtn) {
        restartBtn.onclick = () => {
            window.stopGame?.();
            window.startGame?.();

            document.getElementById("gameOverScreen").classList.add("hidden");
        };
    }


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
