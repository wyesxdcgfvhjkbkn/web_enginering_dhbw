

let started = false;
let animationId = null;

function startGame() {
  if (started) {
    console.log("Skip – schon gestartet");
    return;
  }

  started = true;
  console.log("Spiel startet ✅");

// ===============================
// 🎮 CANVAS SETUP
// ===============================

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas(); // <- DAS ist der entscheidende Fix beim Laden

window.addEventListener("resize", resizeCanvas);

// ===============================
// 🌍 GAME STATE
// ===============================

let waveRunning = false;
let spawnTimer = 0;
let spawnCount = 0;


let hp = 100;
let round = 1;
let money = 100000;

let selectedTower = null;
let isDraggingTower = false;

let mouseX = 0;
let mouseY = 0;

const towers = [];
const enemies = [];
const projectiles = [];
const ENEMIES_PER_WAVE = 10;

// ===============================
// 🗺️ PATH
// ===============================

const path = [
    { x: 0, y: 100 },
    { x: 100, y: 100 },
    { x: 400, y: 100 },
    { x: 400, y: 500 },
    { x: 200, y: 500 },
    { x: 200, y: 250 },
    { x: 800, y: 250 },
    { x: 800, y: 100 },
    { x: 600, y: 100 },
    { x: 600, y: 400 },
    { x: 1350, y: 400 }
];

// ===============================
// 🛒 UI
// ===============================

const shopButton = document.getElementById("shopButton");
const shopPanel = document.getElementById("shopPanel");
const moneyElement = document.getElementById("money");

shopButton.addEventListener("click", () => {
    shopPanel.classList.toggle("hidden");
});

document.querySelectorAll(".shop-item").forEach(item => {
    item.addEventListener("mousedown", (e) => {
        selectedTower = item.dataset.tower;
        isDraggingTower = true;
        e.preventDefault();
    });
});

document.getElementById("startWaveButton").addEventListener("click", () => {
    waveRunning = true;
    spawnTimer = 0;
    spawnCount = 0;
});

const hpElement = document.getElementById("hp");

function updateUI() {
    moneyElement.textContent = money;
}

function updateHP() {
    hpElement.textContent = hp;
}

// ===============================
// 🖱️ MOUSE
// ===============================

canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
});

window.addEventListener("mouseup", () => {
    if (!isDraggingTower || !selectedTower) return;

    if (isOnPath(mouseX, mouseY)) {
        selectedTower = null;
        isDraggingTower = false;
        return;
    }

    const type = TOWER_TYPES[selectedTower];

    if (!type) return;

    if (money < type.cost) {

        selectedTower = null;
        isDraggingTower = false;

        return;
    }

    money -= type.cost;
    updateUI();

    towers.push(
        createTower(selectedTower, mouseX, mouseY)
    );
    
    selectedTower = null
    isDraggingTower = false
});

// ===============================
// 🚫 PATH CHECK
// ===============================

function isOnPath(x, y) {
    for (let i = 0; i < path.length - 1; i++) {
        const a = path[i];
        const b = path[i + 1];

        const dx = b.x - a.x;
        const dy = b.y - a.y;

        const len = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);

        for (let d = 0; d < len; d += 20) {
            const px = a.x + Math.cos(angle) * d;
            const py = a.y + Math.sin(angle) * d;

            const dist = Math.hypot(px - x, py - y);
            if (dist < 40) return true;
        }
    }
    return false;
}

// ===============================
// 👾 SPAWN
// ===============================

function spawnEnemy() {
    enemies.push(createEnemy("soldier", path));
}

// ===============================
// 🔁 UPDATE
// ===============================

function update() {

    function getEnemiesPerWave() {
        return 10 * round;
    }

    // ENEMIES
    for (let e of enemies) {
        if (e.dead) continue;

        const target = path[e.targetIndex];
        if (!target) continue;

        const dx = target.x - e.x;
        const dy = target.y - e.y;
        const dist = Math.hypot(dx, dy);

        e.angle = Math.atan2(dy, dx);

        if (dist > 1) {
            e.x += (dx / dist) * e.speed;
            e.y += (dy / dist) * e.speed;
        }

        if (dist < 10) e.targetIndex++;
    }

    // TOWERS
    for (let t of towers) {

        if (t.cooldown > 0) {
            t.cooldown--;
        }

        let target = null;
        let maxProgress = -1;

        // 🔵 AIM RANGE (nur Zielwahl)
        for (let e of enemies) {
            if (e.dead) continue;

            const d = Math.hypot(e.x - t.x, e.y - t.y);

            if (d < t.aimRange && e.targetIndex > maxProgress) {
                maxProgress = e.targetIndex;
                target = e;
            }
        }

        // ❌ NICHT abbrechen hier, sonst stirbt Rotation!
        if (target) {

            const dx = target.x - t.x;
            const dy = target.y - t.y;

            const targetAngle = Math.atan2(dy, dx);

            // 🟢 IMMER drehen
            t.angle = lerpAngle(t.angle || 0, targetAngle, 0.2);

            const dist = Math.hypot(dx, dy);

            // 🔴 FIRE RANGE + COOLDOWN
            if (t.cooldown <= 0 && dist < t.range) {
                projectiles.push(createProjectile(t, target));
                t.cooldown = t.fireRate;
            }
        }
    }

    // PROJECTILES
   for (let i = projectiles.length - 1; i >= 0; i--) {
        const p = projectiles[i];
        const e = p.target;

        if (!e || e.dead) { 
            projectiles.splice(i, 1); 
            continue; 
        }

        const dx = e.x - p.x;
        const dy = e.y - p.y;
        const dist = Math.hypot(dx, dy);

        if (dist < 10) {
            e.hp -= p.damage;
            if (e.hp <= 0) { e.dead = true; money += e.reward; updateUI(); }
            projectiles.splice(i, 1);
        } else {
            p.x += (dx / dist) * p.speed;
            p.y += (dy / dist) * p.speed;
        }
    }

    // CLEANUP
    for (let i = enemies.length - 1; i >= 0; i--) {

        const e = enemies[i];

        if (e.dead) {
            enemies.splice(i, 1);
            continue;
        }

        if (e.targetIndex >= path.length) {
            hp -= e.damage; // Schaden pro Gegner
            updateHP();
            enemies.splice(i, 1);
        }
    }

    if (waveRunning) {
    spawnTimer += 1 / 60;

        if (spawnTimer >= 0.5 && spawnCount < getEnemiesPerWave()) {
            spawnEnemy();
            spawnCount++;
            spawnTimer = 0;
        }
    }

    const aliveEnemies = enemies.filter(e => !e.dead);

    if (waveRunning && spawnCount >= getEnemiesPerWave() && aliveEnemies.length === 0) {
        waveRunning = false;
        round++;

        document.getElementById("round").textContent = round;

        money += spawnCount * round;
        updateUI();

        spawnTimer = 0;
        spawnCount = 0;
    }

    checkGameOver();
}

function checkGameOver() {

    if (hp <= 0) {

        hp = 0;
        waveRunning = false;

        alert("Game Over");

        // optional reset
        // location.reload();
    }
}

function lerpAngle(a, b, t) {
    let diff = b - a;

    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;

    return a + diff * t;
}
// ===============================
// 🎨 RENDER
// ===============================

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 🌿 Terrain
    renderGrass(ctx, canvas);
    renderPath(ctx, path, dirtImg);

    // 👾 Enemies
    for (let e of enemies) {
        ctx.save();
        ctx.translate(e.x, e.y);
        ctx.rotate(e.angle);
        ctx.drawImage(e.sprite, -64, -64, 128, 128);
        ctx.restore();
    }

    function lerpAngle(a, b, t) {
        let diff = b - a;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        return a + diff * t;
    }

    // 🏗️ Towers
    for (let t of towers) {
        ctx.save();
        ctx.translate(t.x, t.y);
        ctx.rotate((t.angle || 0) + Math.PI / 2);

        ctx.drawImage(t.sprite, -32, -32, 64, 64);

        ctx.restore();
    }

    // 🚀 Projectiles
    for (let p of projectiles) {
        ctx.drawImage(p.sprite, p.x - 32, p.y - 32, 64, 64);
    }

    // 👻 Preview
    if (isDraggingTower && selectedTower) {
        const t = TOWER_TYPES[selectedTower];
        const affordable = money >= t.cost;

        ctx.beginPath();
        ctx.arc(mouseX, mouseY, t.range, 0, Math.PI * 2);
        ctx.strokeStyle = affordable ? "rgb(0, 255, 0)" : "rgb(255, 0, 0)";
        ctx.stroke();

        ctx.globalAlpha = 0.5;
        ctx.drawImage(t.sprite, mouseX - 32, mouseY - 32, 64, 64);
        ctx.globalAlpha = 1;
    }
}

// ===============================
// LOOP
// ===============================

function loop() {
    update();
    render();
    requestAnimationFrame(loop);
}

loop();
updateUI();
updateHP();
}
