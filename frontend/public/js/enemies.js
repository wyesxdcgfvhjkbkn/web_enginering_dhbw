// ===============================
// 👾 ENEMY TYPES
// ===============================

const ENEMY_TYPES = {
    soldier: { hp: 100, speed: 4, reward: 1,   damage: 1,  stealth: false, armored: false, sprite: soldierImg },
    armored: { hp: 250, speed: 3, reward: 5,   damage: 2,  stealth: false, armored: true,  sprite: juggernautImg },
    ninja: { hp: 50,  speed: 5, reward: 10,  damage: 5,  stealth: true,  armored: false, sprite: ninjaImg },
    cyborg:  { hp: 300, speed: 3, reward: 100, damage: 10, stealth: true,  armored: true,  sprite: cyborgImg },
};

// ===============================
// 👾 FACTORY
// ===============================

function createEnemy(type, path) {
    const def = ENEMY_TYPES[type];
    if (!def) {
        console.warn(`Unknown enemy type: "${type}"`);
        return null;
    }

    return {
        x:           path[0].x,
        y:           path[0].y,
        targetIndex: 1,
        hp:          def.hp,
        maxHp:       def.hp,
        speed:       def.speed,
        stealth:     def.stealth,
        armored:     def.armored,
        sprite:      def.sprite,
        type,
        reward:      def.reward,
        damage:      def.damage,
        dead:        false,
        angle:       0,
    };
}
