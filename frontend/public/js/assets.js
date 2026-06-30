// ===============================
// 🖼️ ASSETS
// ===============================


const assets = [];
let loadedCount = 0;

// ✅ Bild-Loader
function loadImage(src) {
    const img = new Image();

    img.onload = () => {
        loadedCount++;
        console.log(`✅ Loaded ${loadedCount}/${assets.length}: ${src}`);
    };

    img.onerror = () => {
        console.error("❌ Fehler beim Laden:", src);
    };

    img.src = "/" + src;

    assets.push(img);
    return img;
}

// ✅ Prüfen ob alles geladen ist
function allAssetsLoaded() {
    return loadedCount === assets.length;
}

window.allAssetsLoaded = allAssetsLoaded;


// Terrain
const grassImg           = loadImage("assets/pictures/Gras.png");
const dirtImg            = loadImage("assets/pictures/Pfad.png");
const dirtcornerImg      = loadImage("assets/pictures/Pfad_Ecke.png");

// Enemies
const soldierImg         = loadImage("assets/pictures/towerDefense_tile245.png");
const juggernautImg      = loadImage("assets/pictures/towerDefense_tile246.png");
const ninjaImg           = loadImage("assets/pictures/towerDefense_tile247.png");
const cyborgImg          = loadImage("assets/pictures/towerDefense_tile248.png");

// Towers
const cannonImg          = loadImage("assets/pictures/MG.png");
const doublecannonImg    = loadImage("assets/pictures/Doppelmg.png");
const rocketImg          = loadImage("assets/pictures/Raketentuk.png");
const bigrocketImg       = loadImage("assets/pictures/Raketentruck.png");
const planeImg           = loadImage("assets/pictures/Flugzeug.png");
const heavyplaneImg      = loadImage("assets/pictures/Jet.png");
const MBTtopImg          = loadImage("assets/pictures/Kanone.png");
const APCtopImg          = loadImage("assets/pictures/APC.png");
const CWISImg            = loadImage("assets/pictures/Flak.png");

// Projectiles
const cannonProjectileImg        = loadImage("assets/pictures/Bullet.png");
const doublecannonProjectileImg  = loadImage("assets/pictures/Granate.png");
const rocketProjectileImg        = loadImage("assets/pictures/Raketeklein.png");
const bigrocketProjectileImg     = loadImage("assets/pictures/Großerakete.png");
const explosionImg               = loadImage("assets/pictures/Explosion.png");

// Music
    const music = [
        new Audio("assets/music/Juhani Junkala [Chiptune Adventures] 1. Stage 1.ogg"),
        new Audio("assets/music/Juhani Junkala [Chiptune Adventures] 2. Stage 2.ogg"),
        new Audio("assets/music/Juhani Junkala [Chiptune Adventures] 3. Boss Fight.ogg"),
        new Audio("assets/music/Juhani Junkala [Chiptune Adventures] 4. Stage Select.ogg")
    ];

    for (const track of music) {
        track.volume = 0.3;
    }


// Sfx
function loadSound(src) {
    const sound = new Audio(src);
    sound.preload = "auto";
    return sound;
}

function playSound(sound, volume = 1) {
    const s = sound.cloneNode();
    s.volume = volume;

    s.currentTime = 0;

    s.play().catch(() => {});
}

const mgSound        = loadSound("assets/sfx/mg.ogg");
const rocketSound    = loadSound("assets/sfx/rocket.ogg");
const tankSound      = loadSound("assets/sfx/tank.ogg");
const apcSound       = loadSound("assets/sfx/apc.ogg");
const explosionSound = loadSound("assets/sfx/explosion.wav");