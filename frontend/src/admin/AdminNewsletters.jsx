import { useEffect, useState } from "react";
import { adminApi, parseApiError, toAbsoluteUploadUrl } from "../services/api";

const initialForm = {
  title: "",
  summary: "",
  pdf: null,
};

export default function AdminNewsletters() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  const loadItems = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await adminApi.newsletters.list();
      setItems(response.data || []);
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const data = new FormData();
      data.append("title", form.title);
      data.append("summary", form.summary);
      if (form.pdf) {
        data.append("pdf", form.pdf);
      }

      if (editingId) {
        await adminApi.newsletters.update(editingId, data);
      } else {
        await adminApi.newsletters.create(data);
      }

      resetForm();
      await loadItems();
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id) => {
    const confirmDelete = window.confirm("Delete this newsletter?");
    if (!confirmDelete) return;

    try {
      setDeletingId(id);
      await adminApi.newsletters.remove(id);
      await loadItems();
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setDeletingId(null);
    }
  };

  const onEdit = (item) => {
    setEditingId(item.id);
    setForm({ title: item.title, summary: item.summary, pdf: null });
  };

  return (
    <div>
      <h2 className="mb-4 text-2xl font-black text-brand-800">Manage Newsletters</h2>

      <form onSubmit={onSubmit} className="mb-6 grid gap-3 rounded-xl border border-brand-100 bg-brand-50/30 p-4 md:grid-cols-2">
        <input
          value={form.title}
          onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
          required
          placeholder="Title"
          className="w-full rounded-lg border border-brand-200 px-3 py-2 outline-none focus:border-brand-500"
        />
        <input
          type="file"
          accept="application/pdf"
          onChange={(event) =>
            setForm((prev) => ({ ...prev, pdf: event.target.files?.[0] || null }))
          }
          className="w-full rounded-lg border border-brand-200 px-3 py-2"
        />
        <textarea
          value={form.summary}
          onChange={(event) => setForm((prev) => ({ ...prev, summary: event.target.value }))}
          rows={3}
          placeholder="Summary"
          className="w-full rounded-lg border border-brand-200 px-3 py-2 outline-none focus:border-brand-500 md:col-span-2"
        />
        <div className="flex gap-2 md:col-span-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-70"
          >
            {saving ? "Saving..." : editingId ? "Update Newsletter" : "Add Newsletter"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border border-brand-200 px-4 py-2 text-sm font-semibold text-brand-700"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
      {loading && <p className="text-sm text-slate-600">Loading...</p>}

      {!loading && (
        <div className="overflow-auto rounded-xl border border-brand-100">
          <table className="min-w-full text-sm">
            <thead className="bg-brand-100/70 text-left text-brand-800">
              <tr>
                <th className="px-3 py-2">Title</th>
                <th className="px-3 py-2">Summary</th>
                <th className="px-3 py-2">PDF</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-brand-100">
                  <td className="px-3 py-2">{item.title}</td>
                  <td className="max-w-xs whitespace-pre-wrap break-words px-3 py-2">{item.summary}</td>
                  <td className="px-3 py-2">
                    {item.pdf_url ? (
                      <a
                        href={toAbsoluteUploadUrl(item.pdf_url)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-brand-700 underline"
                      >
                        Open
                      </a>
                    ) : (
                      "N/A"
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(item)}
                        className="rounded border border-brand-200 px-2 py-1 text-xs font-semibold text-brand-700"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(item.id)}
                        disabled={deletingId === item.id}
                        className="rounded border border-red-200 px-2 py-1 text-xs font-semibold text-red-600"
                      >
                        {deletingId === item.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-3 py-3 text-center text-slate-500">
                    No newsletters found.
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
