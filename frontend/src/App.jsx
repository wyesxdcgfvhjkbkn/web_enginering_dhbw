import { useState, useEffect } from "react";
import { startGame } from "./game";

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
    console.log("Starte Spiel...");
    startGame();
  }, []);

  return (
    <div className="game-wrapper">
      <canvas id="game"></canvas>
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

  
const handleSubmit = (e) => {
  e.preventDefault();

  if (!form.user || !form.password) {
    setError("Bitte alle Felder ausfüllen");
    return;
  }

  // ✅ Fake-Login (für jetzt)
  setUser({ name: form.user });

  setPage("home");
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

  const handleSubmit = (e) => {
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

    console.log("Register:", form);
    setError("");
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
  const data = [
    { user: "Max", score: 1200 },
    { user: "Anna", score: 950 },
  ];

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