import { useEffect, useState } from "react";
import { adminApi, parseApiError } from "../services/api";
import EmptyState from "../components/EmptyState";
import Button from "../components/ui/Button";

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
      <h2 className="heading-h2 mb-2 font-semibold text-gray-900">Contact Messages</h2>
      <p className="mb-4 text-sm text-gray-600">Review and clear incoming public contact requests.</p>
      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
      {loading && <p className="text-sm text-gray-600">Loading...</p>}

      {!loading && (
        <div className="overflow-auto rounded-2xl border border-slate-200">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 bg-slate-100/95 text-left text-gray-700 backdrop-blur">
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
                <tr key={msg.id} className="border-t border-slate-200">
                  <td className="px-3 py-2">{msg.name}</td>
                  <td className="px-3 py-2">{msg.email}</td>
                  <td className="px-3 py-2">{msg.phone}</td>
                  <td className="max-w-xs whitespace-pre-wrap break-words px-3 py-2">{msg.message}</td>
                  <td className="px-3 py-2">
                    <Button
                      type="button"
                      onClick={() => onDelete(msg.id)}
                      disabled={deletingId === msg.id}
                      variant="danger"
                      size="sm"
                    >
                      {deletingId === msg.id ? "Deleting..." : "Delete"}
                    </Button>
                  </td>
                </tr>
              ))}
              {messages.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-6">
                    <EmptyState
                      title="No contact messages"
                      description="Incoming contact requests will appear here."
                    />
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
