// ===============================
// 🧩 PLACEMENT & MERGE SYSTEM
// ===============================

// ── Pfad-Kollision ────────────────────────────────────────

function isOnPath(x, y) {
    for (let i = 0; i < path.length - 1; i++) {
        const a   = path[i];
        const b   = path[i + 1];
        const dx  = b.x - a.x;
        const dy  = b.y - a.y;
        const len = Math.hypot(dx, dy);
        const ang = Math.atan2(dy, dx);

        for (let d = 0; d < len; d += 20) {
            const px = a.x + Math.cos(ang) * d;
            const py = a.y + Math.sin(ang) * d;
            if (Math.hypot(px - x, py - y) < 40) return true;
        }
    }
    return false;
}

// ── Merge-Tabelle ─────────────────────────────────────────

function getMergeResult(a, b) {
    if (!a || !b) return null;

    const key = [a.type, b.type].sort().join("+");

    const table = {
        "cannon+cannon":         "doublecannon",
        "rocket+rocket":         "bigrocket",
        "cannon+rocket":         "CWIS",
        "cannon+doublecannon":   "MBT",
        "doublecannon+rocket":   "APC",
        "bigrocket+cannon":      "gunship",
        "bigrocket+rocket":      "attackplane",
    };

    return table[key] || null;
}

function canMerge(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y) < 60;
}

function mergeTowers(a, b) {
    const resultType = getMergeResult(a, b);
    if (!resultType) return false;

    const iA = towers.indexOf(a);
    const iB = towers.indexOf(b);

    if (iA !== -1) towers.splice(iA, 1);
    if (iB !== -1) towers.splice(iB, 1);

    const merged = createTower(resultType, (a.x + b.x) / 2, (a.y + b.y) / 2);
    if (!merged) return false;

    towers.push(merged);
    return true;
}

// ── Placement-State ───────────────────────────────────────

function getPlacementState(x, y, type) {
    if (!TOWER_TYPES[type]) return "blocked";
    if (isOnPath(x, y))     return "blocked";

    let closest = null;
    let minDist = Infinity;

    for (const t of towers) {
        const d = Math.hypot(t.x - x, t.y - y);
        if (d < minDist) { minDist = d; closest = t; }
    }

    if (!closest || minDist >= 60) return "placeable";

    if (getMergeResult(closest, { type })) return "merge";

    return "blocked";
}

// ── Mouse-Drop ────────────────────────────────────────────

window.addEventListener("mouseup", () => {
    if (!isDraggingTower || !selectedTower) return;

    isDraggingTower = false;

    const state = getPlacementState(mouseX, mouseY, selectedTower);
    if (state === "blocked") { selectedTower = null; return; }

    const def = TOWER_TYPES[selectedTower];
    if (!def || money < def.cost) { selectedTower = null; return; }

    money -= def.cost;
    updateUI();

    const newTower = createTower(selectedTower, mouseX, mouseY);
    if (!newTower) { selectedTower = null; return; }

    if (state === "merge") {
        for (const t of towers) {
            if (canMerge(t, newTower) && mergeTowers(t, newTower)) {
                selectedTower = null;
                return;
            }
        }
    }

    towers.push(newTower);
    selectedTower = null;
});
