// ===============================
// 👾 ENEMY TYPES
// ===============================

const ENEMY_TYPES = {
    soldier: { hp: 100, speed: 2, money: 1, stealth : false , armored : false },
    armored: { hp: 250, speed: 1.5, money: 5, stealth : false , armored : true},
    stealth: { hp: 50, speed: 4, money: 10, stealth : true , armored : false},
    cyborg: { hp: 300, speed: 2.5, money: 100, stealth : true , armored : true},
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
        dead: false,
        angle: 0
    };
}