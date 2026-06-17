// ===============================
// 👾 ENEMY TYPES
// ===============================

const ENEMY_TYPES = {
    soldier: { hp: 100, speed: 4, money: 1, damage: 1, stealth: false, armored: false, sprite: merzwegImg },
    armored: { hp: 250, speed: 3, money: 5, damage: 2, stealth: false, armored: true, sprite: juggernautImg },
    stealth: { hp: 50, speed: 7, money: 10, damage: 5, stealth: true, armored: false, sprite: ninjaImg },
    cyborg: { hp: 300, speed: 3, money: 100, damage: 10, stealth: true, armored: true, sprite: cyborgImg },
};


// ===============================
// 👾 FACTORY
// ===============================

function createEnemy(type, path) {
    const e = ENEMY_TYPES[type];

    return {
        x: path[0].x,
        y: path[0].y,
        targetIndex: 1,

        hp: e.hp,
        speed: e.speed,

        stealth: e.stealth,
        armored: e.armored,

        sprite: e.sprite,
        type: type,

        reward: e.money,
        damage: e.damage,

        dead: false,
        angle: 0
    };
}
