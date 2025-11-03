import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../store/auth";

function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}
function isTunisPhone(v: string) {
 
  if (!v.trim()) return true;
  return /^\+216\d{8}$/.test(v.trim());
}

export default function Register() {
  const nav = useNavigate();
  const register = useAuthStore((s) => s.register);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [pwd, setPwd] = useState("");
  const [pwd2, setPwd2] = useState("");
  const [error, setError] = useState("");

  return (
    <div className="min-h-screen grid place-items-center bg-gray-50">
      <div className="card card-pad w-full max-w-md animate-up">
        <h1 className="text-2xl font-semibold mb-4 text-center">Créer un compte</h1>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
           
            setError("");

           
            if (!name.trim()) { setError("Nom requis."); return; }
            if (!email.trim() || !isEmail(email)) { setError("Email invalide."); return; }
            if (pwd.length < 6) { setError("Mot de passe : 6 caractères minimum."); return; }
            if (pwd !== pwd2) { setError("Les mots de passe ne correspondent pas."); return; }
            if (!isTunisPhone(phone)) { setError("Téléphone invalide. Format attendu: +216XXXXXXXX"); return; }

            await register(name.trim(), email.trim(), pwd);
            nav("/dashboard");
          }}
          className="space-y-3"
          noValidate
        >
          <input
            className="input"
            placeholder="Nom"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
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
            placeholder="Téléphone (+216 ...)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <input
            className="input"
            placeholder="Mot de passe"
            type="password"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            required
            minLength={6}
          />
          <input
            className="input"
            placeholder="Confirmer le mot de passe"
            type="password"
            value={pwd2}
            onChange={(e) => setPwd2(e.target.value)}
            required
          />

        
          {error && <div className="text-red-600 text-sm">{error}</div>}

          <button className="btn btn-primary w-full">Créer le compte</button>
        </form>

        <p className="text-sm text-gray-500 mt-3 text-center">
          Déjà inscrit ? <Link to="/login" className="link">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}
