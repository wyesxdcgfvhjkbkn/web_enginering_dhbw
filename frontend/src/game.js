
export function startGame() {

// ===============================
// 🎮 CANVAS SETUP
// ===============================
  const canvas = document.getElementById("game");

  if (!canvas) {
    console.error("Canvas nicht gefunden");
    return;
  }

  const ctx = canvas.getContext("2d");

// Canvas passt sich Fenster an
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;


// ===============================
// 🖼️ ASSETS (SPRITES / TILES)
// ===============================

const grassImg = new Image();
grassImg.src = "assets/towerDefense_tile157.png"; // 🟩 Gras-Tile

const pathImg = new Image();
pathImg.src = "assets/towerDefense_tile167.png";   // 🟫 Straßen-Tile

const enemyImg = new Image();
enemyImg.src = "assets/towerDefense_tile245.png";  // 👾 Gegner-Sprite

enemyImg.onload = () => {
    console.log("enemy loaded");
};


// ===============================
// 🧱 TILE SYSTEM
// ===============================

const TILE_SIZE = 128;  // Gras-Kachelgröße
const ROAD_TILE = 64;   // Straßen-Segmentgröße


// ===============================
// ⏱️ SPAWN SYSTEM
// ===============================

let spawnTimer = 0;     // Zeitzähler
const spawnInterval = 1; // 1 Sekunde pro Gegner


// ===============================
// 🗺️ PATH (WAYPOINT SYSTEM)
// ===============================

const path = [
    {x: 0, y: 100},
    {x: 100, y: 100},
    {x: 400, y: 100},
    {x: 400, y: 500},
    {x: 200, y: 500},
    {x: 200, y: 250},
    {x: 800, y: 250},
    {x: 800, y: 100},
    {x: 600, y: 100},
    {x: 600, y: 400},
    {x: 1200, y: 400},
    {x: 1500, y: 400},
];


// ===============================
// 👾 GAME STATE
// ===============================

const enemies = []; // alle Gegner im Spiel


// ===============================
// 👾 ENEMY FACTORY
// ===============================

function createEnemy() {
    return {
        x: path[0].x,     // Startpunkt
        y: path[0].y,
        speed: 2,         // Bewegungsgeschwindigkeit
        targetIndex: 1,   // nächster Waypoint
        angle: 0          // Blickrichtung
    };
}


// ===============================
// 🔁 UPDATE LOOP (GAME LOGIC)
// ===============================

function update() {

    // ⏱️ Zeit zählen (ca. 60 FPS → Sekunden)
    spawnTimer += 1 / 60;

    // 👾 Gegner spawnen
    if (spawnTimer >= spawnInterval) {
        enemies.push(createEnemy());
        spawnTimer = 0;
    }

    // ===========================
    // 👾 ENEMY MOVEMENT
    // ===========================
    for (let enemy of enemies) {

        // 🚫 Schutz: wenn Ziel erreicht
        if (enemy.targetIndex >= path.length) continue;

        const target = path[enemy.targetIndex];

        // ➗ Richtung zum Ziel
        const dx = target.x - enemy.x;
        const dy = target.y - enemy.y;

        // 🔄 Rotation (Blickrichtung)
        enemy.angle = Math.atan2(dy, dx);

        // 📏 Abstand
        const distance = Math.sqrt(dx * dx + dy * dy);

        // 🚶 Bewegung Richtung Ziel
        if (distance > 1) {
            enemy.x += (dx / distance) * enemy.speed;
            enemy.y += (dy / distance) * enemy.speed;
        }

        // ➡️ nächster Waypoint
        if (distance <= 9) {
            enemy.targetIndex++;
        }
    }

    // ===========================
    // 🧹 CLEANUP (ENTFERNEN)
    // ===========================
    for (let i = enemies.length - 1; i >= 0; i--) {
        if (enemies[i].targetIndex >= path.length) {
            enemies.splice(i, 1);
        }
    }
}


// ===============================
// 🎨 RENDER LOOP (GRAPHICS)
// ===============================

function render() {

    // 🧽 Screen löschen
    ctx.clearRect(0, 0, canvas.width, canvas.height);


    // ===========================
    // 🟩 GRASS TILE GRID
    // ===========================
    for (let y = 0; y < canvas.height; y += TILE_SIZE) {
        for (let x = 0; x < canvas.width; x += TILE_SIZE) {
            ctx.drawImage(grassImg, x, y, TILE_SIZE, TILE_SIZE);
        }
    }


    // ===========================
    // 🟫 PATH RENDERING
    // ===========================
    for (let i = 0; i < path.length - 1; i++) {

        const from = path[i];
        const to = path[i + 1];

        const dx = to.x - from.x;
        const dy = to.y - from.y;

        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);

        // Straße wird in kleine Tiles zerlegt
        for (let d = 0; d < length; d += ROAD_TILE) {

            const x = from.x + Math.cos(angle) * d;
            const y = from.y + Math.sin(angle) * d;

            ctx.save();

            ctx.translate(x, y);
            ctx.rotate(angle);

            ctx.drawImage(
                pathImg,
                -ROAD_TILE / 2,
                -ROAD_TILE / 2,
                ROAD_TILE,
                ROAD_TILE
            );

            ctx.restore();
        }
    }


    // ===========================
    // 👾 ENEMY RENDERING
    // ===========================
    for (let enemy of enemies) {

        ctx.save();

        // Position setzen
        ctx.translate(enemy.x, enemy.y);

        // Rotation setzen
        ctx.rotate(enemy.angle);

        // Sprite zeichnen (zentriert)
        ctx.drawImage(
            enemyImg,
            -64,
            -64,
            128,
            128
        );

        ctx.restore();
    }
}


// ===============================
// 🔁 GAME LOOP
// ===============================

function loop() {
    update();   // Logik
    render();   // Grafik
    requestAnimationFrame(loop);
}


// ===============================
// 🚀 START GAME
// ===============================

loop();

}
