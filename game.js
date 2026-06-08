const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const grassImg = new Image();
grassImg.src = "assets/towerDefense_tile157.png";

const pathImg = new Image();
pathImg.src = "assets/towerDefense_tile167.png";

const enemyImg = new Image();
enemyImg.src = "assets/towerDefense_tile245.png";

enemyImg.onload = () => {
    console.log("enemy loaded");
};

const TILE_SIZE = 128;
const ROAD_TILE = 64;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let spawnTimer = 1;
const spawnInterval = 1;

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
{x: 10000, y: 400},
];

const enemies =[];

const game = {
    objects: []
};

function update() {
    spawnTimer += 1;

    if (spawnTimer >= spawnInterval) {
        enemies.push(createEnemy());
        spawnTimer = 0;
    }

    for (let enemy of enemies) {
        if (enemy.targetIndex >= path.length) {
            continue;
        }

        const target = path[enemy.targetIndex];

        const dx = target.x - enemy.x;
        const dy = target.y - enemy.y;

        enemy.angle = Math.atan2(dy, dx);

        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 1) {
            enemy.x += (dx / distance) * enemy.speed;
            enemy.y += (dy / distance) * enemy.speed;
        }

        if (distance <= 9) {
            enemy.targetIndex++;
        }
    }

}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let y = 0; y < canvas.height; y += TILE_SIZE) {
            for (let x = 0; x < canvas.width; x += TILE_SIZE) {
                ctx.drawImage(grassImg, x, y, TILE_SIZE, TILE_SIZE);
            }
        }

        for (let i = 0; i < path.length - 1; i++) {

            const from = path[i];
            const to = path[i + 1];

            const dx = to.x - from.x;
            const dy = to.y - from.y;

            const length = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx);

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


    for (let enemy of enemies) {
        ctx.save();

    ctx.translate(enemy.x, enemy.y);
    ctx.rotate(enemy.angle);

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

function loop() {
    update();
    render();
    requestAnimationFrame(loop);

}

function createEnemy() {
    return {
        x: path[0].x,
        y: path[0].y,
        speed: 2,
        targetIndex: 1,
        angle: 0
    };
}

loop();