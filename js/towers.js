// ===============================
// 🏗️ TOWER TYPES
// ===============================

const TOWER_TYPES = {
    cannon: {
        range: 150,
        damage: 25,
        fireRate: 30,
        cost: 50,
        sprite: cannonImg,
        projectileSpeed: 20,
        projectileSprite: cannonProjectileImg
    },

    doublecannon: {
        range: 200,
        damage: 25,
        fireRate: 15,
        cost: 100,
        sprite: doublecannonImg,
        projectileSpeed: 20,
        projectileSprite: doublecannonProjectileImg
    },

    rocket: {
        range: 300,
        damage: 75,
        fireRate: 60,
        cost: 75,
        sprite: rocketImg,
        projectileSpeed: 5,
        projectileSprite: rocketProjectileImg
    },

    bigrocket: {
        range: 500,
        damage: 130,
        fireRate: 30,
        cost: 150,
        sprite: bigrocketImg,
        projectileSpeed: 4,
        projectileSprite: bigrocketProjectileImg
    }
};

// ===============================
// 🏗️ FACTORY
// ===============================

function createTower(type, x, y) {
    const t = TOWER_TYPES[type];

    return {
        type,
        x,
        y,
        range: t.range,
        damage: t.damage,
        fireRate: t.fireRate,
        cooldown: 0,
        sprite: t.sprite,
        projectileSpeed: t.projectileSpeed,
        projectileSprite: t.projectileSprite
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
        sprite: tower.projectileSprite
    };
}