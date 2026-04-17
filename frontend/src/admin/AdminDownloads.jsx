import { useEffect, useState } from "react";
import EmptyState from "../components/EmptyState";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import { adminApi, parseApiError, toAbsoluteUploadUrl } from "../services/api";

const initialForm = {
  title: "",
  description: "",
  pdf: null,
};
const ALLOWED_PDF_TYPES = ["application/pdf"];

export default function AdminDownloads() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  const loadItems = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await adminApi.downloads.list();
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
    setFileInputKey((value) => value + 1);
  };

  const validatePdfFile = (file) => {
    const extension = file.name.split(".").pop()?.toLowerCase() || "";
    if (!ALLOWED_PDF_TYPES.includes(file.type) && extension !== "pdf") {
      return "Only PDF files are allowed.";
    }
    return "";
  };

  const onPdfChange = (event) => {
    const file = event.target.files?.[0] || null;
    if (!file) {
      setForm((prev) => ({ ...prev, pdf: null }));
      return;
    }

    const validationError = validatePdfFile(file);
    if (validationError) {
      setError(validationError);
      event.target.value = "";
      setForm((prev) => ({ ...prev, pdf: null }));
      return;
    }

    setError("");
    setForm((prev) => ({ ...prev, pdf: file }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    const title = form.title.trim();
    const description = form.description.trim();

    if (!title) {
      setError("Title is required.");
      return;
    }

    if (!editingId && !form.pdf) {
      setError("PDF file is required for new entries.");
      return;
    }

    if (form.pdf) {
      const validationError = validatePdfFile(form.pdf);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    setSaving(true);
    setError("");
    try {
      const data = new FormData();
      data.append("title", title);
      data.append("description", description);
      if (form.pdf) {
        data.append("pdf", form.pdf);
      }

      if (editingId) {
        await adminApi.downloads.update(editingId, data);
      } else {
        await adminApi.downloads.create(data);
      }

      resetForm();
      await loadItems();
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const onEdit = (item) => {
    setEditingId(item.id);
    setForm({ title: item.title, description: item.description, pdf: null });
    setFileInputKey((value) => value + 1);
  };

  const onDelete = async (id) => {
    const confirmDelete = window.confirm("Delete this document?");
    if (!confirmDelete) return;

    try {
      setDeletingId(id);
      await adminApi.downloads.remove(id);
      await loadItems();
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <h2 className="heading-h2 mb-2 font-semibold text-gray-900">Manage Downloads</h2>
      <p className="mb-4 text-sm text-gray-600">Upload, update, and organize PDF resources.</p>

      <Card
        as="form"
        onSubmit={onSubmit}
        className="mb-6 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 md:grid-cols-2 md:p-5"
      >
        <Input
          label="Title"
          value={form.title}
          onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
          required
          placeholder="Title"
        />
        <Input
          label="PDF File"
          type="file"
          key={fileInputKey}
          accept="application/pdf"
          onChange={onPdfChange}
          className="cursor-pointer"
        />
        <Input
          as="textarea"
          label="Description"
          containerClassName="md:col-span-2"
          value={form.description}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, description: event.target.value }))
          }
          rows={3}
          placeholder="Description"
        />
        <div className="flex gap-2 md:col-span-2">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : editingId ? "Update File" : "Upload File"}
          </Button>
          {editingId && (
            <Button type="button" onClick={resetForm} variant="secondary">
              Cancel Edit
            </Button>
          )}
        </div>
      </Card>

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
      {loading && <p className="text-sm text-gray-600">Loading...</p>}

      {!loading && (
        <div className="overflow-auto rounded-2xl border border-slate-200">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 bg-slate-100/95 text-left text-gray-700 backdrop-blur">
              <tr>
                <th className="px-3 py-2">Title</th>
                <th className="px-3 py-2">Description</th>
                <th className="px-3 py-2">PDF</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-slate-200">
                  <td className="px-3 py-2">{item.title}</td>
                  <td className="max-w-xs whitespace-pre-wrap break-words px-3 py-2">{item.description}</td>
                  <td className="px-3 py-2">
                    <a
                      href={toAbsoluteUploadUrl(item.pdf_url)}
                      target="_blank"
                      rel="noreferrer"
                      className="focus-ring rounded px-1 text-brand-700 underline"
                    >
                      Open
                    </a>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2">
                      <Button type="button" onClick={() => onEdit(item)} variant="secondary" size="sm">
                        Edit
                      </Button>
                      <Button
                        type="button"
                        onClick={() => onDelete(item.id)}
                        disabled={deletingId === item.id}
                        variant="danger"
                        size="sm"
                      >
                        {deletingId === item.id ? "Deleting..." : "Delete"}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-3 py-6">
                    <EmptyState
                      title="No documents uploaded"
                      description="Upload your first PDF document to show it in the downloads list."
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
