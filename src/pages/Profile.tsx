import React, { useMemo, useState } from "react";
import { useAuthStore } from "../store/auth";
import { api } from "../api/axios";

export default function Profile() {
  const { user } = useAuthStore();
  const [tab, setTab] = useState<"profile" | "security">("profile");

  const initials = useMemo(() => {
    const n = user?.name || "";
    return (
      n
        .split(" ")
        .slice(0, 2)
        .map((s) => s[0]?.toUpperCase())
        .join("") || "U"
    );
  }, [user?.name]);

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: (user as any)?.phone || "",
  });

  const [pw, setPw] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function saveProfile() {
    setLoading(true);
    setSuccess(null);
    setError(null);

    try {
      const { data } = await api.patch("/users/me", form);
      localStorage.setItem("user", JSON.stringify(data));

      setSuccess("Profil mis à jour ✅ (refresh si tu veux voir le header changer)");
    } catch (e: any) {
      setError(e?.response?.data?.error || "Erreur lors de la mise à jour");
    } finally {
      setLoading(false);
    }
  }

  async function changePassword() {
    setLoading(true);
    setSuccess(null);
    setError(null);

    try {
      if (!pw.currentPassword || !pw.newPassword)
        return setError("Remplis tous les champs.");

      if (pw.newPassword.length < 6)
        return setError("Le nouveau mot de passe doit contenir au moins 6 caractères.");

      if (pw.newPassword !== pw.confirmPassword)
        return setError("Confirmation du mot de passe incorrecte.");

      await api.patch("/users/me/password", {
        currentPassword: pw.currentPassword,
        newPassword: pw.newPassword,
      });

      setPw({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setSuccess("Mot de passe modifié ✅");
    } catch (e: any) {
      setError(e?.response?.data?.error || "Erreur lors du changement de mot de passe");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border p-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-xl font-semibold">
            {initials}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-gray-900">Mon profil</h1>
            <p className="text-sm text-gray-500">
              {user?.role?.toUpperCase()} • {user?.email}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6 flex gap-2">
          <button
            onClick={() => setTab("profile")}
            className={`px-4 py-2 rounded-xl text-sm font-medium border ${
              tab === "profile"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700"
            }`}
          >
            Profil
          </button>

          <button
            onClick={() => setTab("security")}
            className={`px-4 py-2 rounded-xl text-sm font-medium border ${
              tab === "security"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700"
            }`}
          >
            Sécurité
          </button>
        </div>

        {/* Alerts */}
        {success && (
          <div className="mt-4 rounded-xl bg-green-50 text-green-700 px-4 py-3 text-sm">
            {success}
          </div>
        )}
        {error && (
          <div className="mt-4 rounded-xl bg-red-50 text-red-700 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* Content */}
        {tab === "profile" && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Nom" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
            <Field
              label="Téléphone"
              value={form.phone}
              onChange={(v) => setForm({ ...form, phone: v })}
            />
            <div className="md:col-span-2">
              <Field label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
            </div>

            <div className="md:col-span-2 flex justify-end">
              <button
                onClick={saveProfile}
                disabled={loading}
                className={`px-5 py-2.5 rounded-xl font-medium text-white transition ${
                  loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {loading ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </div>
        )}

        {tab === "security" && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field
              label="Mot de passe actuel"
              type="password"
              value={pw.currentPassword}
              onChange={(v) => setPw({ ...pw, currentPassword: v })}
            />
            <div />
            <Field
              label="Nouveau mot de passe"
              type="password"
              value={pw.newPassword}
              onChange={(v) => setPw({ ...pw, newPassword: v })}
            />
            <Field
              label="Confirmer"
              type="password"
              value={pw.confirmPassword}
              onChange={(v) => setPw({ ...pw, confirmPassword: v })}
            />

            <div className="md:col-span-2 flex justify-end">
              <button
                onClick={changePassword}
                disabled={loading}
                className={`px-5 py-2.5 rounded-xl font-medium text-white transition ${
                  loading ? "bg-gray-400 cursor-not-allowed" : "bg-gray-900 hover:bg-black"
                }`}
              >
                {loading ? "Mise à jour..." : "Mettre à jour"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </label>
  );
}
