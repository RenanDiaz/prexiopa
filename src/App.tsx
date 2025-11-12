import { useState } from "react";
import { supabase } from "./supabaseClient";
import "./App.css";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [isRegister, setIsRegister] = useState(false);

  // Maneja el inicio de sesión
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const { data: userData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) setError(error.message);
    else setUser(userData.user);
  };

  // Maneja el registro de usuario
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const { data: userData, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) setError(error.message);
    else {
      setUser(userData.user);
      // Puedes mostrar un mensaje de verificación si tu proyecto lo requiere
    }
  };

  // Ejemplo: obtener datos de una tabla llamada 'items'
  const fetchData = async () => {
    const { data, error } = await supabase.from("items").select("*");
    if (error) setError(error.message);
    else setData(data || []);
  };

  return (
    <div style={{ maxWidth: 400, margin: "2rem auto" }}>
      <h1>Supabase Auth Demo</h1>
      {!user ? (
        <form onSubmit={isRegister ? handleRegister : handleLogin} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">{isRegister ? "Registrarse" : "Iniciar sesión"}</button>
          <button type="button" style={{ background: 'none', color: 'blue', textDecoration: 'underline', border: 'none', cursor: 'pointer' }} onClick={() => { setIsRegister(!isRegister); setError(null); }}>
            {isRegister ? "¿Ya tienes cuenta? Inicia sesión" : "¿No tienes cuenta? Regístrate"}
          </button>
          {error && <div style={{ color: "red" }}>{error}</div>}
        </form>
      ) : (
        <div>
          <p>Bienvenido, {user.email}</p>
          <button onClick={fetchData}>Cargar datos de 'items'</button>
          <ul>
            {data.map((item, idx) => (
              <li key={idx}>{JSON.stringify(item)}</li>
            ))}
          </ul>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              setUser(null);
            }}
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
