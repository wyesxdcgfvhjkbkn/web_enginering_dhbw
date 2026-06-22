import { useState, useEffect, useRef } from "react";

export default function App() {
  const params = new URLSearchParams(window.location.search);
  const initialPage = params.get("page") || "home";

  const [page, setPage] = useState(initialPage);
  const [user, setUser] = useState(null);

  // ✅ Theme laden
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  const renderPage = () => {
    switch (page) {
      case "login":
        return <Login setUser={setUser} setPage={setPage}/>;
      case "register":
        return <Register />;
      case "profile":
        return <Profile />;
      case "highscores":
        return <Highscores />;
      case "maps":
        return <Maps />;
      case "game":
        return <Game />;
      default:
        return <Home setPage={setPage} />;
    }
  };

  
return (
  <div>
    <Navbar setPage={setPage} />

    {page === "game" ? (
      renderPage()
    ) : (
      <div className="container mt-4">
        {renderPage()}
      </div>
    )}
  </div>
);

}

//////////////////////////////////////////////////////


function Game() {
  
useEffect(() => {

  // ✅ STATE IMMER SETZEN (nicht nur im if!)
  if (!window.state) {
    window.state = {
      waveRunning : false,
      spawnTimer  : 0,
      spawnCount  : 0,

      hp    : 100,
      round : 1,
      money : 500,

      selectedTower   : null,
      isDraggingTower : false,

      mouseX : 0,
      mouseY : 0,

      towers     : [],
      enemies    : [],
      projectiles : [],

      path: [
        { x: 0, y: 100 },
        { x: 100, y: 100 },
        { x: 400, y: 100 },
        { x: 400, y: 250 },
        { x: 400, y: 500 },
        { x: 200, y: 500 },
        { x: 200, y: 250 },
        { x: 400, y: 250 },
        { x: 600, y: 250 },
        { x: 800, y: 250 },
        { x: 800, y: 100 },
        { x: 600, y: 100 },
        { x: 600, y: 250 },
        { x: 600, y: 400 },
        { x: 1350, y: 400 },
      ]
    };
  }

  // ✅ Scripts nur einmal laden
  if (!window.__scriptsLoaded) {

    window.__scriptsLoaded = true;

    const scripts = [
      "/js/assets.js",
      "/js/terrain.js",
      "/js/enemies.js",
      "/js/towers.js",
      "/js/game.js",
      "/js/placement.js",
      "/js/ui.js",
      "/js/waveSystem.js"
    ];

    let loadedCount = 0;

    scripts.forEach(src => {
      const script = document.createElement("script");
      script.src = src;

      script.onload = () => {
        loadedCount++;

        if (loadedCount === scripts.length) {
          console.log("Alle Scripts geladen ✅");
          window.startGame?.();
        }
      };

      document.body.appendChild(script);
    });

  } else {
    console.log("Scripts schon geladen ✅");
    window.startGame?.();
  }

  // ✅ ✅ WICHTIG: CLEANUP (JETZT funktioniert er)
  return () => {
    console.log("Spiel wird gestoppt (Unmount)");
    window.stopGame?.();
  };

  }, []);


  return (
    <div>

      {/* 🎮 UI */}
      <div id="ui">

        <div className="ui-box">
          ❤️ HP: <span id="hp">100</span>
        </div>

        <div className="ui-box">
          🎯 Runde: <span id="round">1</span>
        </div>

        <div className="ui-box">
          💰 Geld: <span id="money">100</span>
        </div>

        <button id="startWaveButton">START</button>

        <div className="shop-container">

          <div className="ui-box shop-button" id="shopButton">
            🛒 Shop
          </div>

          <div className="shop-panel hidden" id="shopPanel">

            <div className="shop-item" data-tower="cannon">
              <img src="/assets/towerDefense_tile249.png" alt="Kanone" />
              <div className="shop-text">
                <div>Kanone</div>
                <div className="shop-price">💰 50</div>
              </div>
            </div>

            <div className="shop-item" data-tower="doublecannon">
              <img src="/assets/towerDefense_tile250.png" alt="Doppelkanone" />
              <div className="shop-text">
                <div>Doppelkanone</div>
                <div className="shop-price">💰 100</div>
              </div>
            </div>

            <div className="shop-item" data-tower="rocket">
              <img src="/assets/towerDefense_tile205.png" alt="Rakete" />
              <div className="shop-text">
                <div>Rakete</div>
                <div className="shop-price">💰 75</div>
              </div>
            </div>

            <div className="shop-item" data-tower="bigrocket">
              <img src="/assets/towerDefense_tile206.png" alt="Große Rakete" />
              <div className="shop-text">
                <div>Große Rakete</div>
                <div className="shop-price">💰 150</div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 🎮 Canvas */}
      <canvas id="game"></canvas>

      {/* Credit */}
      <div id="credit">
        Assets by Kenney.nl
      </div>

    </div>
  );
}

//////////////////////////////////////////////////////


function Navbar({ setPage, user, setUser }) {

  const toggleTheme = () => {
    const current = document.documentElement.getAttribute("data-theme");
    const newTheme = current === "dark" ? "light" : "dark";

    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const handleLogout = () => {
    setUser(null);
    setPage("home");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">

        <button
          className="navbar-brand btn btn-link text-white"
          onClick={() => setPage("home")}
        >
          Tower Defense
        </button>

        <ul className="navbar-nav ms-auto d-flex flex-row gap-3">

          {/* ✅ wenn NICHT eingeloggt */}
          {!user && (
            <>
              <li>
                <button className="btn btn-link text-white" onClick={() => setPage("login")}>
                  Login
                </button>
              </li>

              <li>
                <button className="btn btn-link text-white" onClick={() => setPage("register")}>
                  Register
                </button>
              </li>
            </>
          )}

          {/* ✅ wenn eingeloggt */}
          {user && (
            <>
              <li>
                <button className="btn btn-link text-white" onClick={() => setPage("profile")}>
                  Profil
                </button>
              </li>

              <li>
                <button className="btn btn-link text-white" onClick={handleLogout}>
                  Logout
                </button>
              </li>
            </>
          )}

          <li>
            <button className="btn btn-link text-white" onClick={() => setPage("highscores")}>
              Highscores
            </button>
          </li>

          <li>
            <button className="btn btn-link text-white" onClick={() => setPage("maps")}>
              Maps
            </button>
          </li>

          <li>
            <button className="btn btn-outline-light ms-2" onClick={toggleTheme}>
              Theme
            </button>
          </li>

        </ul>
      </div>
    </nav>
  );
}

//////////////////////////////////////////////////////

function Home({ setPage }) {
  return (
    <div>
      <h1>Willkommen</h1>
      <p>Tower Defense Game</p>

      <button
        className="btn btn-primary"
        onClick={() => setPage("game")}
      >
        Spiel starten
      </button>
    </div>
  );
}

//////////////////////////////////////////////////////

function Login({setUser}) {
  const [form, setForm] = useState({ user: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };


const handleSubmit = async (e) => {
  e.preventDefault();

  if (!form.user || !form.password) {
    setError("Bitte alle Felder ausfüllen");
    return;
  }

  try {
    const res = await fetch("http://localhost:3000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      setError("Login fehlgeschlagen");
      return;
    }

    setUser(data.user);   // ✅ wichtig
    setPage("home");

  } catch (err) {
    setError("Server nicht erreichbar");
  }
};

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>

      <input
        name="user"
        onChange={handleChange}
        className="form-control mb-2"
        placeholder="Name oder E-Mail"
      />

      <input
        name="password"
        type="password"
        onChange={handleChange}
        className="form-control mb-2"
        placeholder="Passwort"
      />

      <button className="btn btn-primary w-100">Login</button>

      <div className="text-danger mt-2">{error}</div>
    </form>
  );
}

//////////////////////////////////////////////////////

function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.password || !form.confirm) {
      setError("Alle Felder ausfüllen");
      return;
    }

    if (!isValidEmail(form.email)) {
      setError("Ungültige E-Mail-Adresse");
      return;
    }

    if (form.password.length < 6) {
      setError("Passwort muss mindestens 6 Zeichen lang sein");
      return;
    }

    if (form.password !== form.confirm) {
      setError("Passwörter stimmen nicht überein");
      return;
    }

    
    // ✅ NEU: Backend-Aufruf
    try {
      const res = await fetch("http://localhost:3000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError("Registrierung fehlgeschlagen");
        return;
      }

      // ✅ Erfolg
      console.log("Register erfolgreich:", data);
      setError("");

    } catch (err) {
      setError("Server nicht erreichbar");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Register</h2>

      <input
        name="name"
        onChange={handleChange}
        className="form-control mb-2"
        placeholder="Name"
      />

      <input
        name="email"
        onChange={handleChange}
        className={`form-control mb-2 ${
          form.email && !isValidEmail(form.email) ? "is-invalid" : ""
        }`}
        placeholder="E-Mail"
      />

      <input
        name="password"
        type="password"
        onChange={handleChange}
        className="form-control mb-2"
        placeholder="Passwort"
      />

      <input
        name="confirm"
        type="password"
        onChange={handleChange}
        className="form-control mb-2"
        placeholder="Passwort wiederholen"
      />

      <button className="btn btn-success w-100">Registrieren</button>

      <div className="text-danger mt-2">{error}</div>
    </form>
  );
}

//////////////////////////////////////////////////////

function Profile() {
  return (
    <div>
      <h2>Profil</h2>
      <p>Username: TestUser</p>
      <p>Highscore: 12345</p>
      <p>Maps erstellt: 3</p>
    </div>
  );
}

//////////////////////////////////////////////////////

function Highscores() {
  
const [data, setData] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/highscore")
      .then(res => res.json())
      .then(setData);
  }, []);


  return (
    <div>
      <h2>Highscores</h2>
      <table className="table">
        <thead>
          <tr>
            <th>User</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {data.map((entry, i) => (
            <tr key={i}>
              <td>{entry.user}</td>
              <td>{entry.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

//////////////////////////////////////////////////////

function Maps() {
  const maps = ["Map 1", "Map 2"];

  return (
    <div>
      <h2>Maps</h2>
      <ul className="list-group">
        {maps.map((map, i) => (
          <li key={i} className="list-group-item">
            {map}
          </li>
        ))}
      </ul>
      <button className="btn btn-primary mt-3">Neue Map</button>
    </div>
  );
}