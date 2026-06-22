// ===============================
// 🌊 WAVE SYSTEM
// ===============================

const ENEMIES_PER_WAVE = 10;

function getEnemiesPerWave() {
    return ENEMIES_PER_WAVE * round;
}

function pickEnemyType() {
    const r = Math.random();
    if (round >= 9 && r < 0.01) return "cyborg";
    if (round >= 6 && r < 0.10) return "stealth";
    if (round >= 3 && r < 0.30) return "armored";
    return "soldier";
}

function spawnEnemy() {
    const e = createEnemy(pickEnemyType(), path);
    if (e) enemies.push(e);
}

function startWave() {
    waveRunning = true;
    spawnTimer  = 0;
    spawnCount  = 0;
}

function updateWave() {
    if (!waveRunning) return;

    // 👾 Spawning (alle 0.5 s)
    spawnTimer += 1 / 60;

    if (spawnTimer >= 0.5 && spawnCount < getEnemiesPerWave()) {
        spawnEnemy();
        spawnCount++;
        spawnTimer = 0;
    }

    // ✅ Welle beendet?
    const alive = enemies.filter(e => !e.dead);

    if (spawnCount >= getEnemiesPerWave() && alive.length === 0) {
        waveRunning = false;
        round++;

        money += spawnCount * round;

        updateRound();
        updateUI();

        spawnTimer = 0;
        spawnCount = 0;
    }
}
