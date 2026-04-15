import { useEffect, useState } from "react";
import { adminApi, parseApiError } from "../services/api";

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  const loadMessages = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await adminApi.contacts.list();
      setMessages(response.data || []);
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const onDelete = async (id) => {
    const confirmDelete = window.confirm("Delete this message?");
    if (!confirmDelete) return;

    try {
      setDeletingId(id);
      await adminApi.contacts.remove(id);
      await loadMessages();
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <h2 className="heading-h2 mb-2 font-black text-brand-800">Contact Messages</h2>
      <p className="mb-4 text-sm text-slate-600">Review and clear incoming public contact requests.</p>
      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
      {loading && <p className="text-sm text-slate-600">Loading...</p>}

      {!loading && (
        <div className="overflow-auto rounded-xl border border-brand-100">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 bg-brand-100/90 text-left text-brand-800 backdrop-blur">
              <tr>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Phone</th>
                <th className="px-3 py-2">Message</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((msg) => (
                <tr key={msg.id} className="border-t border-brand-100">
                  <td className="px-3 py-2">{msg.name}</td>
                  <td className="px-3 py-2">{msg.email}</td>
                  <td className="px-3 py-2">{msg.phone}</td>
                  <td className="max-w-xs whitespace-pre-wrap break-words px-3 py-2">{msg.message}</td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() => onDelete(msg.id)}
                      disabled={deletingId === msg.id}
                      className="focus-ring rounded border border-red-200 px-2 py-1 text-xs font-semibold text-red-600"
                    >
                      {deletingId === msg.id ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
              {messages.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-3 text-center text-slate-500">
                    No contact messages found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
