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
const soldierImg         = loadImage("assets/merz.png");
const juggernautImg      = loadImage("assets/putin.png");
const ninjaImg           = loadImage("assets/schroeder.png");
const cyborgImg          = loadImage("assets/trump.png");

// Towers
const cannonImg          = loadImage("assets/MG.png");
const doublecannonImg    = loadImage("assets/Doppelmg.png");
const rocketImg          = loadImage("assets/Raketentuk.png");
const bigrocketImg       = loadImage("assets/Raketentruck.png");
const planeImg           = loadImage("assets/Flugzeug.png");
const heavyplaneImg      = loadImage("assets/Jet.png");
const MBTtopImg          = loadImage("assets/Kanone.png");
const MBTbottomImg       = loadImage("assets/towerDefense_tile268.png");
const APCtopImg          = loadImage("assets/APC.png");
const APCbottomImg       = loadImage("assets/towerDefense_tile269.png");
const CWISImg            = loadImage("assets/Flak.png");

// Projectiles
const cannonProjectileImg        = loadImage("assets/Bullet.png");
const doublecannonProjectileImg  = loadImage("assets/Granate.png");
const rocketProjectileImg        = loadImage("assets/Raketeklein.png");
const bigrocketProjectileImg     = loadImage("assets/Großerakete.png");
const explosionImg               = loadImage("assets/Explosion.png");
