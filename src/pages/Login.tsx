import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../store/auth";

function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export default function Login() {
  const nav = useNavigate();
  // selector avoids unnecessary re-renders
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen grid place-items-center bg-gray-50">
      <div className="card card-pad w-full max-w-md animate-up">
        <h1 className="text-2xl font-semibold mb-4 text-center">Connexion</h1>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setError("");

            if (!email.trim() || !isEmail(email)) { setError("Email invalide."); return; }
            if (pwd.length < 6) { setError("Mot de passe : 6 caractères minimum."); return; }

            try {
              setLoading(true);
              await login(email.trim(), pwd);     // calls /api/auth/login, stores token+user
              nav("/", { replace: true });        // go to dashboard route ("/")
            } catch (err: any) {
              // show backend message if present
              setError(err?.response?.data?.error || "Échec de la connexion.");
            } finally {
              setLoading(false);
            }
          }}
          className="space-y-3"
          noValidate
        >
          <input
            className="input"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="input"
            placeholder="Mot de passe"
            type="password"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            required
          />

          {error && <div className="text-red-600 text-sm">{error}</div>}

          <button className="btn btn-primary w-full" disabled={loading}>
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <p className="text-sm text-gray-500 mt-3 text-center">
          Pas de compte ? <Link to="/register" className="link">S’inscrire</Link>
        </p>
      </div>
    </div>
  );
}
