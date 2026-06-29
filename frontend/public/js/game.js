const game = {
    started: false,
    running: false,
    animationId: null,
    canvas: null,
    ctx: null
};

let currentTrack = null;

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
        state.explosions.length = 0;

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
        const { enemies, towers, projectiles, explosions, hp, money, waveRunning, path, priorityOrder } = window.state;

        // ===============================
        // 🖱️ INPUT
        // ===============================

        canvas.addEventListener("mousemove", (e) => {
            const rect = canvas.getBoundingClientRect();
            state.mouseX = e.clientX - rect.left;
            state.mouseY = e.clientY - rect.top;
        });

        // Background Music
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
                    state.hp -= e.damage;
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
            const { path, enemies, towers, projectiles, explosions, isDraggingTower, selectedTower, mouseX, mouseY } = window.state;

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

                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(ang);
                ctx.drawImage(sprite, -75, -75, 150, 150);
                ctx.restore();
            }

            // Explosions
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
        playRandomMusic();
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


    if (currentTrack) {
        currentTrack.onended = null;
        currentTrack.pause();
        currentTrack.currentTime = 0;
    }

}

window.stopGame = stopGame;