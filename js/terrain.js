// ===============================
// 🌍 TILEMAP / TERRAIN RENDERER
// ===============================

const TILE_SIZE = 128;

// optional: mehrere Grass Variants möglich
const grassTiles = [
    grassImg
];

// ===============================
// 🌿 GRASS RENDER
// ===============================

function renderGrass(ctx, canvas) {
    for (let y = 0; y < canvas.height; y += TILE_SIZE) {
        for (let x = 0; x < canvas.width; x += TILE_SIZE) {
            const tile = grassTiles[0];
            ctx.drawImage(tile, x, y, TILE_SIZE, TILE_SIZE);
        }
    }
}

// ===============================
// 🛣️ PATH RENDER
// ===============================

function renderPath(ctx, path, pathImg) {
    for (let i = 0; i < path.length - 1; i++) {
        const from = path[i];
        const to = path[i + 1];

        const dx = to.x - from.x;
        const dy = to.y - from.y;

        const len = Math.hypot(dx, dy);
        const angle = Math.atan2(dy, dx);

        for (let d = 0; d < len; d += 64) {
            const x = from.x + Math.cos(angle) * d;
            const y = from.y + Math.sin(angle) * d;

            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle);
            ctx.drawImage(dirtImg, -32, -32, 64, 64);
            ctx.restore();
        }
    }
}