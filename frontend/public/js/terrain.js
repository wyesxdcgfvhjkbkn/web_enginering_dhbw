// ===============================
// 🌍 TERRAIN RENDERER
// ===============================

const TILE_SIZE = 128;

function renderGrass(ctx, canvas) {
    for (let y = 0; y < canvas.height; y += TILE_SIZE) {
        for (let x = 0; x < canvas.width; x += TILE_SIZE) {
            ctx.drawImage(grassImg, x, y, TILE_SIZE, TILE_SIZE);
        }
    }
}

function renderPath(ctx, path) {
    const SIZE = 50;
    const R    = SIZE / 2;

    for (let i = 0; i < path.length - 1; i++) {
        const a = path[i];
        const b = path[i + 1];

        let dx = b.x - a.x;
        let dy = b.y - a.y;
        const len = Math.hypot(dx, dy);

        if (len === 0) continue;

        const nx = dx / len;
        const ny = dy / len;

        const startX = a.x + nx * R;
        const startY = a.y + ny * R;
        const endX   = b.x - nx * R;
        const endY   = b.y - ny * R;

        dx = endX - startX;
        dy = endY - startY;

        const segLen = Math.hypot(dx, dy);
        if (segLen === 0) continue;

        const step  = SIZE;
        const angle = Math.atan2(dy, dx);

        for (let d = 0; d <= segLen; d += step) {
            const x = startX + (dx / segLen) * d;
            const y = startY + (dy / segLen) * d;

            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle);
            ctx.drawImage(dirtImg, -25, -25, SIZE, SIZE);
            ctx.restore();
        }
    }

    for (const p of path) {
        ctx.drawImage(dirtcornerImg, p.x - 25, p.y - 25, 50, 50);
    }
}
