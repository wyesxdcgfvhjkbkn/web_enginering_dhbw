// ===============================
// 🏗️ TOWER TYPES
// ===============================

const TOWER_TYPES = {

    // ── Basis-Türme (kaufbar) ──────────────────────────────

    cannon: {
        range:            150,
        aimRange:         200,
        damage:           25,
        fireRate:         30,
        cost:             50,
        level:            1,
        sprite:           cannonImg,
        projectileSpeed:  20,
        projectileSprite: cannonProjectileImg,
        projectileType: "bullet",
        candestroy:         ["soldier"],
        projectileExplosion: false,
    },

    rocket: {
        range:            300,
        aimRange:         350,
        damage:           75,
        fireRate:         60,
        cost:             75,
        level:            1,
        sprite:           rocketImg,
        projectileSpeed:  5,
        projectileSprite: rocketProjectileImg,
        projectileType: "rocket",
        candestroy:         ["soldier", "armored"],
        projectileExplosion: true,
    },

    // ── Stufe 2 (Merge aus 2× Basis) ──────────────────────

    doublecannon: {          // cannon + cannon
        range:            200,
        aimRange:         250,
        damage:           30,
        fireRate:         15,
        cost:             0,
        level:            2,
        sprite:           doublecannonImg,
        projectileSpeed:  20,
        projectileSprite: cannonProjectileImg,
        projectileType: "bullet",
        candestroy:         ["soldier"],
        projectileExplosion: false
        },

    bigrocket: {             // rocket + rocket
        range:            500,
        aimRange:         550,
        damage:           150,
        fireRate:         120,
        cost:             0,
        level:            2,
        sprite:           bigrocketImg,
        projectileSpeed:  5,
        projectileSprite: bigrocketProjectileImg,
        projectileType: "rocket",
        candestroy:         ["soldier", "armored"],
        projectileExplosion: true,
    },

    CWIS: {                  // cannon + rocket
        range:            300,
        aimRange:         350,
        damage:           25,
        fireRate:         10,
        cost:             0,
        level:            2,
        sprite:           CWISImg,
        projectileSpeed:  12,
        projectileSprite: cannonProjectileImg,
        projectileType: "bullet",
        candestroy:         ["soldier", "ninja"],
        projectileExplosion: true,
    },

    // ── Stufe 3 (Merge aus Stufe-2 + Basis) ───────────────

    MBT: {                   // doublecannon + cannon
        range:            250,
        aimRange:         300,
        damage:           60,
        fireRate:         20,
        cost:             0,
        level:            3,
        sprite:           MBTtopImg,
        projectileSpeed:  20,
        projectileSprite: cannonProjectileImg,
        projectileType: "bullet",
        candestroy:         ["soldier", "armored", "ninja", "cyborg"],
        projectileExplosion: false,
    },

    APC: {                   // doublecannon + rocket
        range:            300,
        aimRange:         350,
        damage:           80,
        fireRate:         30,
        cost:             0,
        level:            3,
        sprite:           APCtopImg,
        projectileSpeed:  8,
        projectileSprite: rocketProjectileImg,
        projectileType: "rocket",
        candestroy:         ["soldier", "armored", "ninja", "cyborg"],
        projectileExplosion: true,
    },

    gunship: {               // bigrocket + cannon
        range:            400,
        aimRange:         450,
        damage:           120,
        fireRate:         40,
        cost:             0,
        level:            3,
        sprite:           planeImg,
        projectileSpeed:  15,
        projectileSprite: cannonProjectileImg,
        projectileType: "bullet",
        candestroy:         ["soldier", "armored", "ninja", "cyborg"],
        projectileExplosion: false,
    },

    attackplane: {           // bigrocket + rocket
        range:            500,
        aimRange:         550,
        damage:           200,
        fireRate:         90,
        cost:             0,
        level:            3,
        sprite:           heavyplaneImg,
        projectileSpeed:  6,
        projectileSprite: bigrocketProjectileImg,
        projectileType: "rocket",
        candestroy:         ["soldier", "armored", "ninja", "cyborg"],
        projectileExplosion: true,
    },
};

// ===============================
// 🏗️ FACTORY
// ===============================

function createTower(type, x, y) {
    const def = TOWER_TYPES[type];
    if (!def) {
        console.warn(`Unknown tower type: "${type}"`);
        return null;
    }

   return {
        type,
        x,
        y,

        range: def.range,
        aimRange: def.aimRange,
        damage: def.damage,
        fireRate: def.fireRate,

        cooldown: 0,
        angle: 0,

        sprite: def.sprite,

        projectileSpeed: def.projectileSpeed,
        projectileSprite: def.projectileSprite,
        projectileType: def.projectileType,

        candestroy: def.candestroy,
        projectileExplosion: def.projectileExplosion,
    };
}

// ===============================
// 🚀 PROJECTILE FACTORY
// ===============================

function createProjectile(tower, target) {
    return {
        x: tower.x,
        y: tower.y,
        target,
        speed: tower.projectileSpeed,
        damage: tower.damage,
        sprite: tower.projectileSprite,
        type: tower.projectileType,
        candestroy: tower.candestroy,
        explodes: tower.projectileExplosion,
    };
}
