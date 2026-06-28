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
const explosions = [];
const priorityOrder = ["cyborg", "ninja", "armored", "soldier"];

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

let currentTrack = null;

function playRandomMusic() {

    if (currentTrack) {
        currentTrack.pause();
        currentTrack.currentTime = 0;
    }

    currentTrack = music[Math.floor(Math.random() * music.length)];

    currentTrack.play();

    currentTrack.onended = playRandomMusic;
}

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

        let target = null;

        for (const type of priorityOrder) {

            let best = null;
            let bestProgress = -1;

            for (const e of enemies) {

                if (e.dead) continue;
                if (e.type !== type) continue;
                if (!t.candestroy.includes(e.type)) continue;

                const dx = e.x - t.x;
                const dy = e.y - t.y;
                const dist = Math.hypot(dx, dy);

                if (dist > t.aimRange) continue;

                if (e.targetIndex > bestProgress) {
                    bestProgress = e.targetIndex;
                    best = e;
                }
            }

            if (best) {
                target = best;
                break;
            }
        }
    

        // 👇 NACH der kompletten Suche
        if (target) {

            const dx = target.x - t.x;
            const dy = target.y - t.y;
            const angle = Math.atan2(dy, dx);

            let diff = angle - t.angle;

            while (diff > Math.PI) diff -= Math.PI * 2;
            while (diff < -Math.PI) diff += Math.PI * 2;

            t.angle += diff * 0.2;

            if (t.cooldown <= 0 && Math.hypot(dx, dy) < t.range) {
                switch (t.type) {

                    case "cannon":
                    case "doublecannon":
                    case "gunship":
                        playSound(mgSound, 0.4);
                        break;

                    case "rocket":
                    case "bigrocket":
                    case "attackplane":
                        playSound(rocketSound, 0.5);
                        break;

                    case "MBT":
                        playSound(tankSound, 0.6);
                        break;

                    case "APC":
                    case "CWIS":
                        playSound(apcSound, 0.5);
                        break;
                }

                projectiles.push(createProjectile(t, target));
                t.cooldown = t.fireRate;
            }
        }
    }

    // 🚀 Projectiles
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const p = projectiles[i];
        const e = p.target;

        if (!e || e.dead) {

            if (p.type === "rocket") {

                let bestTarget = null;
                let bestDist = Infinity;

                for (const enemy of enemies) {

                    if (enemy.dead) continue;
                    if (!p.candestroy.includes(enemy.type)) continue;

                    const d = Math.hypot(enemy.x - p.x, enemy.y - p.y);

                    if (d < bestDist) {
                        bestDist = d;
                        bestTarget = enemy;
                    }
                }

                if (bestTarget) {
                    p.target = bestTarget;
                    continue;
                }
            }

            projectiles.splice(i, 1);
            continue;
        }

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

            if (p.explodes) {
                explosions.push({
                    x: p.x,
                    y: p.y,
                    sprite: explosionImg,
                    frame: 0,
                    timer: 0
                });

                playSound(explosionSound, 0.6);
            }


            projectiles.splice(i, 1);
        } else {
            p.x += (dx / dist) * p.speed;
            p.y += (dy / dist) * p.speed;
        }
    }

    for (let i = explosions.length - 1; i >= 0; i--) {

        const ex = explosions[i];

        ex.timer++;

        if (ex.timer >= 4) {
            ex.timer = 0;
            ex.frame++;
        }

        if (ex.frame >= 16) {
            explosions.splice(i, 1);
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


        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(ang);
        ctx.drawImage(sprite, -75, -75, 150, 150);
        ctx.restore();
    }

    for (const ex of explosions) {

        const frameSize = 1000;

        const sx = (ex.frame % 4) * frameSize;
        const sy = Math.floor(ex.frame / 4) * frameSize;

        ctx.drawImage(
            ex.sprite,
            sx, sy,
            frameSize, frameSize,
            ex.x - 75,
            ex.y - 75,
            150, 150
        );
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
playRandomMusic();
updateUI();
updateHP();
updateRound();
