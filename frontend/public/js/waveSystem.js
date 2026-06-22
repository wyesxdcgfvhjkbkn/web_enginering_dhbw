// ===============================
// 🌊 WAVE SYSTEM
// ===============================

const ENEMIES_PER_WAVE = 10;

function getEnemiesPerWave() {
    const {round} = window.state;
    return ENEMIES_PER_WAVE * round;
}

function pickEnemyType() {
    const {round} = window.state;
    const r = Math.random();
    if (round >= 9 && r < 0.01) return "cyborg";
    if (round >= 6 && r < 0.10) return "stealth";
    if (round >= 3 && r < 0.30) return "armored";
    return "soldier";
}

function spawnEnemy() {
    const state = window.state;
    const e = createEnemy(pickEnemyType(), state.path);
    if (e) state.enemies.push(e);
}

function startWave() {
    const state = window.state;
    state.waveRunning = true;
    state.spawnTimer  = 0;
    state.spawnCount  = 0;
}

function updateWave() {
    const state = window.state;
    if (!state.waveRunning) return;

    // 👾 Spawning (alle 0.5 s)
    state.spawnTimer += 1 / 60;

    if (state.spawnTimer >= 0.5 && state.spawnCount < getEnemiesPerWave()) {
        spawnEnemy();
        state.spawnCount++;
        state.spawnTimer = 0;
    }

    // ✅ Welle beendet?
    const alive = state.enemies.filter(e => !e.dead);

    if (state.spawnCount >= getEnemiesPerWave() && alive.length === 0) {
        state.waveRunning = false;
        state.round++;

        state.money += state.spawnCount * state.round;

        updateRound();
        updateUI();

        state.spawnTimer = 0;
        state.spawnCount = 0;
    }
}
