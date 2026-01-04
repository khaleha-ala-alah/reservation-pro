import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../store/auth";

function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function isTunisPhone(v: string) {
  if (!v.trim()) return true; // الهاتف اختياري لكن لو موجود لازم يكون صحيح
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
  const [loading, setLoading] = useState(false);

  // ✅ كود التحقق
  const [verificationCode, setVerificationCode] = useState<string>("");
  const [codeInput, setCodeInput] = useState("");
  const [codeError, setCodeError] = useState("");
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);

  // ✅ مودال "الإيميل موجود مسبقاً"
  const [emailExistsModal, setEmailExistsModal] = useState(false);

  // إخفاء رسالة الخطأ العامة بعد وقت بسيط (اختياري)
  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(""), 4000);
    return () => clearTimeout(t);
  }, [error]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setCodeError("");

    // ✅ 1) التحقق من البيانات
    if (!name.trim()) {
      setError("Nom requis.");
      return;
    }
    if (!email.trim() || !isEmail(email)) {
      setError("Email invalide.");
      return;
    }
    if (pwd.length < 6) {
      setError("Mot de passe : 6 caractères minimum.");
      return;
    }
    if (pwd !== pwd2) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (!isTunisPhone(phone)) {
      setError("Téléphone invalide. Format attendu: +216XXXXXXXX");
      return;
    }

    // ✅ 2) توليد كود التحقق وفتح المودال
    const code = String(Math.floor(100000 + Math.random() * 900000)); // 6 chiffres
    setVerificationCode(code);
    setCodeInput("");
    setIsCodeModalOpen(true);

    // (للتطوير فقط يمكنك console.log الكود)
    console.log("DEV verification code:", code);
  }

  async function handleConfirmCode() {
    setCodeError("");

    if (codeInput.trim() !== verificationCode) {
      setCodeError("Code incorrect. Veuillez réessayer.");
      return;
    }

    // ✅ الكود صحيح → نرسل الطلب للـ backend
    try {
      setLoading(true);
      await register(
        name.trim(),
        email.trim(),
        pwd,
        phone.trim() || undefined
      );
      setIsCodeModalOpen(false);
      nav("/dashboard", { replace: true });
    } catch (err: any) {
      setLoading(false);
      setIsCodeModalOpen(false);

      // لو الايميل موجود مسبقاً
      if (err?.response?.status === 409) {
        setEmailExistsModal(true);
      } else {
        setError(
          err?.response?.data?.error || "Erreur lors de la création du compte."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-gray-50">
      <div className="card card-pad w-full max-w-md animate-up relative">
        <h1 className="text-2xl font-semibold mb-4 text-center">
          Créer un compte
        </h1>

        <form
          onSubmit={handleSubmit}
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
            placeholder="Téléphone (+216XXXXXXXX)"
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

          {error && (
            <div className="text-red-600 text-sm bg-red-50 border border-red-200 px-3 py-2 rounded">
              {error}
            </div>
          )}

          <button
            className="btn btn-primary w-full"
            disabled={loading}
          >
            {loading ? "Création du compte..." : "Créer le compte"}
          </button>
        </form>

        <p className="text-sm text-gray-500 mt-3 text-center">
          Déjà inscrit ?{" "}
          <Link to="/login" className="link">
            Se connecter
          </Link>
        </p>
      </div>

      {/* ✅ Modal كود التحقق */}
      {isCodeModalOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsCodeModalOpen(false)}
          />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-fade">
              <h2 className="text-xl font-semibold text-center mb-2">
                Vérification de l'email
              </h2>
              <p className="text-sm text-gray-600 text-center mb-4">
                Entrez le code de vérification envoyé à votre email.
              </p>

              {/* لأغراض التطوير فقط يمكنك إظهار الكود هنا أو في console.log */}
              <p className="text-xs text-gray-400 text-center mb-2">
                (Code DEV: {verificationCode})
              </p>

              <input
                className="input text-center tracking-[0.3em] text-lg"
                placeholder="••••••"
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
                maxLength={6}
              />

              {codeError && (
                <div className="text-red-600 text-xs mt-1 text-center">
                  {codeError}
                </div>
              )}

              <div className="mt-4 flex justify-end gap-3">
                <button
                  className="btn btn-secondary"
                  onClick={() => setIsCodeModalOpen(false)}
                >
                  Annuler
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleConfirmCode}
                  disabled={loading}
                >
                  Confirmer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Modal لو الإيميل موجود مسبقاً */}
      {emailExistsModal && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setEmailExistsModal(false)}
          />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-fade">
              <h2 className="text-lg font-semibold mb-2 text-center">
                Email déjà utilisé
              </h2>
              <p className="text-sm text-gray-600 mb-4 text-center">
                Un compte avec cet email existe déjà. Essayez de vous connecter.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  className="btn btn-secondary"
                  onClick={() => setEmailExistsModal(false)}
                >
                  Fermer
                </button>
                <Link
                  to="/login"
                  className="btn btn-primary"
                >
                  Aller à la connexion
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
