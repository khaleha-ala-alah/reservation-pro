import React, { useEffect, useMemo, useState } from "react";
import { api } from "../../api/axios";
import { useAuthStore } from "../../store/auth";
import { useNavigate } from "react-router-dom";

type Role = "admin" | "user" | "supervisor";

type UserRow = {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  createdAt?: string;
};

export default function AdminUsers() {
  const nav = useNavigate();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) return;
    if (user.role !== "admin") nav("/dashboard");
  }, [user, nav]);

  const [users, setUsers] = useState<UserRow[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<UserRow | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "user" as Role,
    phone: "",
    password: "",
  });

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get("/users");
      setUsers(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return users;
    return users.filter((u) => {
      const id = (u._id || u.id || "").toLowerCase();
      return (
        u.name.toLowerCase().includes(s) ||
        u.email.toLowerCase().includes(s) ||
        (u.role || "").toLowerCase().includes(s) ||
        (u.phone || "").toLowerCase().includes(s) ||
        id.includes(s)
      );
    });
  }, [users, q]);

  function startCreate() {
    setEditing(null);
    setForm({ name: "", email: "", role: "user", phone: "", password: "" });
    setOpen(true);
  }

  function startEdit(u: UserRow) {
    setEditing(u);
    setForm({
      name: u.name || "",
      email: u.email || "",
      role: u.role || "user",
      phone: u.phone || "",
      password: "",
    });
    setOpen(true);
  }

  async function save() {
    try {
      if (!form.email) return alert("Email required");
      if (!editing && !form.password) return alert("Password required for new user");

      if (editing) {
        const id = editing._id || editing.id;
        await api.put(`/users/${id}`, {
          name: form.name,
          email: form.email,
          role: form.role,
          phone: form.phone,
        });
      } else {
        await api.post(`/users`, {
          name: form.name,
          email: form.email,
          role: form.role,
          phone: form.phone,
          password: form.password,
        });
      }

      setOpen(false);
      await load();
    } catch (e: any) {
      alert(e?.response?.data?.error || "Error");
    }
  }

  async function del(u: UserRow) {
    const id = u._id || u.id;
    const ok = confirm(`Supprimer ${u.email} ?`);
    if (!ok) return;

    try {
      await api.delete(`/users/${id}`);
      await load();
    } catch (e: any) {
      alert(e?.response?.data?.error || "Delete failed");
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Gestion des utilisateurs</h1>
            <p className="text-sm text-gray-500">Ajouter, modifier, supprimer (US5)</p>
          </div>

          <div className="flex gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher (nom, email, rôle...)"
              className="rounded-xl border px-3 py-2.5 w-64"
            />
            <button
              onClick={startCreate}
              className="px-4 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700"
            >
              + Ajouter
            </button>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600 border-b">
                <th className="py-3">Nom</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Rôle</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="py-6 text-gray-500" colSpan={5}>Chargement...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td className="py-6 text-gray-500" colSpan={5}>Aucun utilisateur</td></tr>
              ) : (
                filtered.map((u) => {
                  const id = u._id || u.id || "";
                  return (
                    <tr key={id} className="border-b">
                      <td className="py-3 font-medium text-gray-900">{u.name}</td>
                      <td className="text-gray-700">{u.email}</td>
                      <td className="text-gray-700">{u.phone || "-"}</td>
                      <td>
                        <span className="px-2 py-1 rounded-lg bg-gray-100 text-gray-700">
                          {u.role}
                        </span>
                      </td>
                      <td className="text-right">
                        <button
                          onClick={() => startEdit(u)}
                          className="px-3 py-1.5 rounded-lg border hover:bg-gray-50 mr-2"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => del(u)}
                          className="px-3 py-1.5 rounded-lg border text-red-600 hover:bg-red-50"
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-gray-900">
              {editing ? "Modifier utilisateur" : "Ajouter utilisateur"}
            </h2>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="Nom" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
              <Field label="Téléphone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
              <div className="md:col-span-2">
                <Field label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
              </div>

              <label className="block">
                <span className="text-sm font-medium text-gray-700">Rôle</span>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
                  className="mt-1 w-full rounded-xl border px-3 py-2.5"
                >
                  <option value="user">user</option>
                  <option value="supervisor">supervisor</option>
                  <option value="admin">admin</option>
                </select>
              </label>

              {!editing && (
                <Field
                  label="Mot de passe"
                  type="password"
                  value={form.password}
                  onChange={(v) => setForm({ ...form, password: v })}
                />
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2.5 rounded-xl border hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={save}
                className="px-4 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
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
        className="mt-1 w-full rounded-xl border px-3 py-2.5"
      />
    </label>
  );
}
