// ===============================
// 🖼️ ASSETS
// ===============================

function loadImage(src) {
    const img = new Image();
    img.src = src;
    return img;
}

// Terrain
const grassImg           = loadImage("assets/Gras.png");
const dirtImg            = loadImage("assets/Pfad.png");
const dirtcornerImg      = loadImage("assets/Pfad_Ecke.png");

// Enemies
const soldierImg         = loadImage("assets/towerDefense_tile245.png");
const juggernautImg      = loadImage("assets/towerDefense_tile246.png");
const ninjaImg           = loadImage("assets/towerDefense_tile247.png");
const cyborgImg          = loadImage("assets/towerDefense_tile248.png");

// Towers
const cannonImg          = loadImage("assets/MG.png");
const doublecannonImg    = loadImage("assets/Doppelmg.png");
const rocketImg          = loadImage("assets/Raketenturm.png");
const bigrocketImg       = loadImage("assets/Großerraketenturm.png");
const planeImg           = loadImage("assets/towerDefense_tile270.png");
const heavyplaneImg      = loadImage("assets/towerDefense_tile271.png");
const MBTtopImg          = loadImage("assets/Kanone.png");
const MBTbottomImg       = loadImage("assets/towerDefense_tile268.png");
const APCtopImg          = loadImage("assets/towerDefense_tile292.png");
const APCbottomImg       = loadImage("assets/towerDefense_tile269.png");
const CWISImg            = loadImage("assets/towerDefense_tile204.png");

// Projectiles
const cannonProjectileImg        = loadImage("assets/Bullet.png");
const doublecannonProjectileImg  = loadImage("assets/Granate.png");
const rocketProjectileImg        = loadImage("assets/Rakete_an1.png");
const rocketProjectileImgalt     = loadImage("assets/Rakete_an2.png");
const bigrocketProjectileImg     = loadImage("assets/Großerakete_an1.png");
const bigrocketProjectilealtImg  = loadImage("assets/Großerakete_an2.png");
