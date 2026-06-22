

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
const ctx    = canvas.getContext("2d");

function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;

    canvas.width  = window.innerWidth  * dpr;
    canvas.height = window.innerHeight * dpr;

    canvas.style.width  = window.innerWidth  + "px";
    canvas.style.height = window.innerHeight + "px";

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// ===============================
// 🌍 GAME STATE
// ===============================

let waveRunning = false;
let spawnTimer  = 0;
let spawnCount  = 0;

let hp    = 100;
let round = 1;
let money = 500;

let selectedTower   = null;
let isDraggingTower = false;

let mouseX = 0;
let mouseY = 0;

const towers     = [];
const enemies    = [];
const projectiles = [];

// ===============================
// 🗺️ PATH
// ===============================

const path = [
    { x:    0, y: 100 },
    { x:  100, y: 100 },
    { x:  400, y: 100 },
    { x:  400, y: 250 },
    { x:  400, y: 500 },
    { x:  200, y: 500 },
    { x:  200, y: 250 },
    { x:  400, y: 250 },
    { x:  600, y: 250 },
    { x:  800, y: 250 },
    { x:  800, y: 100 },
    { x:  600, y: 100 },
    { x:  600, y: 250 },
    { x:  600, y: 400 },
    { x: 1350, y: 400 },
];

// ===============================
// 🖱️ INPUT
// ===============================

canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
});

// ===============================
// 🔁 UPDATE
// ===============================

function update() {

    // 👾 Enemies bewegen
    for (const e of enemies) {
        if (e.dead) continue;

        const target = path[e.targetIndex];
        if (!target) continue;

        const dx   = target.x - e.x;
        const dy   = target.y - e.y;
        const dist = Math.hypot(dx, dy);

        e.angle = Math.atan2(dy, dx);

        if (dist > 1) {
            e.x += (dx / dist) * e.speed;
            e.y += (dy / dist) * e.speed;
        }

        if (dist < 10) e.targetIndex++;
    }

    // 🏗️ Towers schießen
    for (const t of towers) {
        if (t.cooldown > 0) t.cooldown--;

        let target      = null;
        let maxProgress = -1;

        for (const e of enemies) {
            if (e.dead) continue;
            const d = Math.hypot(e.x - t.x, e.y - t.y);
            if (d < t.aimRange && e.targetIndex > maxProgress) {
                maxProgress = e.targetIndex;
                target = e;
            }
        }

        if (target) {
            const dx    = target.x - t.x;
            const dy    = target.y - t.y;
            const angle = Math.atan2(dy, dx);

            t.angle = t.angle + (angle - t.angle) * 0.2;

            if (t.cooldown <= 0 && Math.hypot(dx, dy) < t.range) {
                projectiles.push(createProjectile(t, target));
                t.cooldown = t.fireRate;
            }
        }
    }

    // 🚀 Projectiles
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const p = projectiles[i];
        const e = p.target;

        if (!e || e.dead) { projectiles.splice(i, 1); continue; }

        const dx   = e.x - p.x;
        const dy   = e.y - p.y;
        const dist = Math.hypot(dx, dy);

        if (dist < 10) {
            e.hp -= p.damage;

            if (e.hp <= 0) {
                e.dead = true;
                money += e.reward;
                updateUI();
            }

            projectiles.splice(i, 1);
        } else {
            p.x += (dx / dist) * p.speed;
            p.y += (dy / dist) * p.speed;
        }
    }

    // 🧹 Cleanup + Schaden am Spieler
    for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];

        if (e.dead) { enemies.splice(i, 1); continue; }

        if (e.targetIndex >= path.length) {
            hp -= e.damage;
            updateHP();
            enemies.splice(i, 1);
        }
    }

    // 🌊 Wave-Logik
    updateWave();

    // 💀 Game Over
    checkGameOver();
}

// ===============================
// 💀 GAME OVER
// ===============================

function checkGameOver() {
    if (hp > 0) return;

    hp = 0;
    updateHP();
    waveRunning = false;

    if (!window._gameOver) {
        window._gameOver = true;
        setTimeout(() => alert("💀 Game Over! Runde: " + round), 100);
    }
}

// ===============================
// 🎨 RENDER
// ===============================

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    renderGrass(ctx, canvas);
    renderPath(ctx, path);

    // 👾 Enemies
    for (const e of enemies) {
        if (e.dead) continue;

        ctx.save();
        ctx.translate(e.x, e.y);
        ctx.rotate(e.angle);
        ctx.drawImage(e.sprite, -64, -64, 128, 128);
        ctx.restore();
    }

    // 🏗️ Towers
    for (const t of towers) {
        ctx.save();
        ctx.translate(t.x, t.y);
        ctx.rotate(t.angle + Math.PI / 2);
        ctx.drawImage(t.sprite, -75, -75, 150, 150);
        ctx.restore();
    }

    // 🚀 Projectiles
   for (const p of projectiles) {
        const ang = Math.atan2(p.target.y - p.y, p.target.x - p.x) + Math.PI / 2;

        let sprite = p.sprite;

        if (p.type === "rocket") {
            if (Math.floor(Date.now() / 50) % 2 === 0) {
                sprite = projectileSprite;
            } else {
                sprite = projectileSpritealt;
            }
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(ang);
        ctx.drawImage(sprite, -75, -75, 150, 150);
        ctx.restore();
    }

    // 🖱️ Drag-Preview
    if (isDraggingTower && selectedTower) {
        const state = getPlacementState(mouseX, mouseY, selectedTower);
        const def   = TOWER_TYPES[selectedTower];

        const color =
            state === "placeable" ? "rgba(0,255,0,0.6)" :
            state === "merge"     ? "rgba(0,140,255,0.7)" :
                                    "rgba(255,0,0,0.6)";

        ctx.beginPath();
        ctx.arc(mouseX, mouseY, def.range, 0, Math.PI * 2);
        ctx.strokeStyle = color;
        ctx.lineWidth   = 2;
        ctx.stroke();

        ctx.globalAlpha = 0.5;
        ctx.drawImage(def.sprite, mouseX - 75, mouseY - 75, 150, 150);
        ctx.globalAlpha = 1;
    }
}

// ===============================
// 🔄 MAIN LOOP
// ===============================

function loop() {
    update();
    render();
    requestAnimationFrame(loop);
}

loop();
initUI();
updateUI();
updateHP();
updateRound();

}
