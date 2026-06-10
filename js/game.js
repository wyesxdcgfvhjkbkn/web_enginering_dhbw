// ===============================
// 🎮 CANVAS SETUP
// ===============================

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// ===============================
// 🌍 GAME STATE
// ===============================

let waveRunning = false;
let spawnTimer = 0;

let hp = 100;
let round = 1;
let money = 100;

let selectedTower = null;
let isDraggingTower = false;

let mouseX = 0;
let mouseY = 0;

const towers = [];
const enemies = [];
const projectiles = [];

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
    { x: 1400, y: 400 }
];

// ===============================
// 🛒 UI
// ===============================

const shopButton = document.getElementById("shopButton");
const shopPanel = document.getElementById("shopPanel");

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
});

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

    towers.push(createTower(selectedTower, mouseX, mouseY));

    selectedTower = null;
    isDraggingTower = false;
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
    spawnTimer += 1 / 60;

    if (waveRunning && spawnTimer >= 1) {
        spawnEnemy();
        spawnTimer = 0;
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
            continue;
        }

        let target = null;
        let min = Infinity;

        for (let e of enemies) {
            if (e.dead) continue;

            const d = Math.hypot(e.x - t.x, e.y - t.y);

            if (d < t.range && d < min) {
                min = d;
                target = e;
            }
        }

        if (target) {
            projectiles.push(createProjectile(t, target));
            t.cooldown = t.fireRate;
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

        p.x += (dx / dist) * p.speed;
        p.y += (dy / dist) * p.speed;

        if (dist < 10) {
            e.hp -= p.damage;
            if (e.hp <= 0) e.dead = true;

            projectiles.splice(i, 1);
        }
    }

    // CLEANUP
    for (let i = enemies.length - 1; i >= 0; i--) {
        if (enemies[i].dead || enemies[i].targetIndex >= path.length) {
            enemies.splice(i, 1);
        }
    }
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
        ctx.drawImage(soldierImg, -64, -64, 128, 128);
        ctx.restore();
    }

    // 🏗️ Towers
    for (let t of towers) {
        ctx.drawImage(t.sprite, t.x - 32, t.y - 32, 64, 64);
    }

    // 🚀 Projectiles
    for (let p of projectiles) {
        ctx.drawImage(p.sprite, p.x - 20, p.y - 20, 64, 64);
    }

    // 👻 Preview
    if (isDraggingTower && selectedTower) {
        const t = TOWER_TYPES[selectedTower];

        ctx.beginPath();
        ctx.arc(mouseX, mouseY, t.range, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(0,150,255,0.4)";
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