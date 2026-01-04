import React, { useEffect, useState } from "react";
import { api } from "../../api/axios";
import { useAuthStore } from "../../store/auth";
import { useNavigate } from "react-router-dom";

export default function AuditLogs() {
  const nav = useNavigate();
  const { user } = useAuthStore();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (user.role !== "admin") nav("/dashboard");
  }, [user, nav]);

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get("/audit?limit=80");
      setLogs(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Audit logs</h1>
            <p className="text-sm text-gray-500">Traçabilité des actions (bonus sécurité)</p>
          </div>
          <button onClick={load} className="px-4 py-2.5 rounded-xl border hover:bg-gray-50">
            Rafraîchir
          </button>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600 border-b">
                <th className="py-3">Date</th>
                <th>Action</th>
                <th>Actor</th>
                <th>Target</th>
                <th>IP</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="py-6 text-gray-500" colSpan={5}>Chargement...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td className="py-6 text-gray-500" colSpan={5}>Aucun log</td></tr>
              ) : (
                logs.map((l) => (
                  <tr key={l._id} className="border-b">
                    <td className="py-3 text-gray-700">{new Date(l.createdAt).toLocaleString()}</td>
                    <td className="font-medium">{l.action}</td>
                    <td className="text-gray-700">{l.actorId?.email || "-"}</td>
                    <td className="text-gray-700">{l.targetUserId?.email || "-"}</td>
                    <td className="text-gray-700">{l.ip || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
