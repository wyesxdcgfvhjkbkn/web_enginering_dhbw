
const game = {
    started: false,
    running: false,
    animationId: null,
    canvas: null,
    ctx: null
};

function startGame() {
    if (game.started) {
        console.log("Skip – schon gestartet");
        return;
    }

    // 🍵 Wait for assets  
    const wait = () => {
        if (!window.allAssetsLoaded()) {
            requestAnimationFrame(wait);
            return;
        }

        console.log("✅ Alle Assets geladen!");

        game.started = true;
        game.running = true;

        console.log("Spiel startet ✅");

        // ❎ Reset

        const state = window.state;

        // ✅ ALLES zurücksetzen
        state.hp = 100;
        state.round = 1;
        state.money = 500;

        state.waveRunning = false;
        state.spawnTimer = 0;
        state.spawnCount = 0;

        state.towers.length = 0;
        state.enemies.length = 0;
        state.projectiles.length = 0;

        // ✅ GameOver zurücksetzen
        window._gameOver = false;

        const screen = document.getElementById("gameOverScreen");
        screen?.classList.add("hidden");


        game.canvas = document.getElementById("game");
        game.ctx = game.canvas.getContext("2d");



        // ===============================
        // 🎮 CANVAS SETUP
        // ===============================


        if (!game.canvas) {
            console.error("Canvas NICHT gefunden!");
            return;
        }

        const canvas = document.getElementById("game");
        const ctx = game.canvas.getContext("2d");

        const rect = game.canvas.getBoundingClientRect();

        game.canvas.width = rect.width;
        game.canvas.height = rect.height;

        // ===============================
        // 🌍 GAME STATE
        // ===============================
        const { enemies, towers, projectiles, hp, money, waveRunning, path } = window.state;

        // ===============================
        // 🖱️ INPUT
        // ===============================

        canvas.addEventListener("mousemove", (e) => {
            const rect = canvas.getBoundingClientRect();
            state.mouseX = e.clientX - rect.left;
            state.mouseY = e.clientY - rect.top;
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

            // 🏗️ Towers schießen
            for (const t of towers) {
                if (t.cooldown > 0) t.cooldown--;

                let target = null;
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
                    const dx = target.x - t.x;
                    const dy = target.y - t.y;
                    const angle = Math.atan2(dy, dx);

                    t.angle = t.angle + (angle - t.angle) * 0.2;

                    if (t.cooldown <= 0 && Math.hypot(dx, dy) < t.range) {
                        state.projectiles.push(createProjectile(t, target));
                        t.cooldown = t.fireRate;
                    }
                }
            }

            // 🚀 Projectiles
            for (let i = projectiles.length - 1; i >= 0; i--) {
                const p = projectiles[i];
                const e = p.target; // 🎯🎯🎯

                if (!e || e.dead) { projectiles.splice(i, 1); continue; }

                const dx = e.x - p.x;
                const dy = e.y - p.y;
                const dist = Math.hypot(dx, dy);

                if (dist < 10) {
                    e.hp -= p.damage;

                    if (e.hp <= 0) {
                        e.dead = true;
                        state.money += e.reward;
                        updateUI();
                    }

                    state.projectiles.splice(i, 1);
                } else {
                    p.x += (dx / dist) * p.speed;
                    p.y += (dy / dist) * p.speed;
                }
            }

            // 🧹 Cleanup + Schaden am Spieler
            for (let i = state.enemies.length - 1; i >= 0; i--) {
                const e = state.enemies[i];

                if (e.dead) { state.enemies.splice(i, 1); continue; }

                if (e.targetIndex >= state.path.length) {
                    state.hp -= e.damage;
                    updateHP();
                    state.enemies.splice(i, 1);
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
            if (state.hp > 0) return;


            if (!window._gameOver) {
                console.log("Game Over");
                state.hp = 0;
                updateHP();
                state.waveRunning = false;
                window._gameOver = true;
                showGameOver();
            }
        }


        function showGameOver() {
            const screen = document.getElementById("gameOverScreen");
            const newHighscoreText = document.getElementById("newHighscoreText");
            const saveBtn = document.getElementById("saveScoreBtn");

            const score = state.round;
            const best = parseInt(localStorage.getItem("highscore") || "0");
            console.log("Score:", score, "Best:", best);

            const user = JSON.parse(localStorage.getItem("user"));

            // ✅ neuer Highscore
            if (score > best) {
                localStorage.setItem("highscore", score);

                // 🌈 Text anzeigen
                newHighscoreText.classList.remove("hidden");

                if (user) {
                    // ✅ EINGELOGGT → automatisch speichern

                    saveBtn.style.display = "none";

                    fetch("http://localhost:3000/highscore", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            user: user.name,
                            score: score,
                        }),
                    });

                    console.log("✅ Highscore automatisch gespeichert");

                } else {
                    // ❌ NICHT eingeloggt → Button anzeigen
                    saveBtn.textContent = "Einloggen, um Highscore zu speichern";

                    saveBtn.onclick = () => {
                        window.stopGame?.();          // Spiel stoppen
                        window.changePage?.("login"); // zur Login-Seite wechseln
                    };

                }

            } else {
                // ❌ kein Highscore

                newHighscoreText.classList.add("hidden");
                saveBtn.style.display = "none";
            }

            // ✅ Anzeige
            document.getElementById("finalRound").textContent = state.round;
            document.getElementById("finalMoney").textContent = state.money;

            screen.classList.remove("hidden");
        }



        // ===============================
        // 🎨 RENDER
        // ===============================

        function render() {
            const { path, enemies, towers, projectiles, isDraggingTower, selectedTower, mouseX, mouseY } = window.state;

            const ctx = game.ctx;
            const canvas = game.canvas;

            if (!ctx || !canvas) return;

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
                const def = TOWER_TYPES[selectedTower];

                const color =
                    state === "placeable" ? "rgba(0,255,0,0.6)" :
                        state === "merge" ? "rgba(0,140,255,0.7)" :
                            "rgba(255,0,0,0.6)";

                ctx.beginPath();
                ctx.arc(mouseX, mouseY, def.range, 0, Math.PI * 2);
                ctx.strokeStyle = color;
                ctx.lineWidth = 2;
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
            if (!game.running) return;

            update();
            render();

            game.animationId = requestAnimationFrame(loop);
        }


        loop();
        initUI();
        updateUI();
        updateHP();
        updateRound();

    };

    wait();

}

function stopGame() {
    console.log("Spiel gestoppt ❌");

    game.running = false;

    if (game.animationId) {
        cancelAnimationFrame(game.animationId);
        game.animationId = null;
    }

    game.canvas = null;
    game.ctx = null;

    game.started = false;
    window._gameOver = false;
}

window.stopGame = stopGame;