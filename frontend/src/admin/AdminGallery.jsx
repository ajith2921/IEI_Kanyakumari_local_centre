import { useEffect, useState } from "react";
import { adminApi, parseApiError, toAbsoluteUploadUrl } from "../services/api";
import ImageMedia from "../components/ImageMedia";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function AdminGallery() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", imageFile: null, imageUrl: "" });
  const [fileInputKey, setFileInputKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [previewSource, setPreviewSource] = useState("");

  useEffect(() => {
    if (form.imageFile) {
      const objectUrl = URL.createObjectURL(form.imageFile);
      setPreviewSource(objectUrl);

      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    }

    setPreviewSource(form.imageUrl.trim());
    return undefined;
  }, [form.imageFile, form.imageUrl]);

  const resetForm = () => {
    setForm({ title: "", description: "", imageFile: null, imageUrl: "" });
    setFileInputKey((value) => value + 1);
  };

  const validateFile = (file) => {
    const extension = file.name.split(".").pop()?.toLowerCase() || "";
    const validMimeType = ALLOWED_IMAGE_TYPES.includes(file.type);
    const validExtension = ["jpg", "jpeg", "png", "webp"].includes(extension);

    if (!validMimeType && !validExtension) {
      return "Only JPG, PNG, and WEBP images are allowed.";
    }
    return "";
  };

  const loadItems = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await adminApi.gallery.list();
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

  const onSubmit = async (event) => {
    event.preventDefault();
    const title = form.title.trim();
    const description = form.description.trim();
    const imageUrl = form.imageUrl.trim();

    if (!form.imageFile && !imageUrl) {
      setError("Please choose an image file or provide an image URL.");
      return;
    }

    if (form.imageFile) {
      const validationError = validateFile(form.imageFile);
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
      if (form.imageFile) {
        data.append("image", form.imageFile);
      } else {
        data.append("image_url", imageUrl);
      }
      await adminApi.gallery.create(data);
      resetForm();
      await loadItems();
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id) => {
    const confirmDelete = window.confirm("Delete this gallery image?");
    if (!confirmDelete) return;

    try {
      setDeletingId(id);
      await adminApi.gallery.remove(id);
      await loadItems();
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setDeletingId(null);
    }
  };

  const onFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    if (!file) {
      setForm((prev) => ({ ...prev, imageFile: null }));
      return;
    }

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      event.target.value = "";
      setForm((prev) => ({ ...prev, imageFile: null }));
      return;
    }

    setError("");
    setForm((prev) => ({ ...prev, imageFile: file }));
  };

  return (
    <div>
      <h2 className="heading-h2 mb-2 font-black text-brand-800">Manage Gallery</h2>
      <p className="mb-4 text-sm text-slate-600">Upload and manage event photos for the public gallery.</p>

      <form
        onSubmit={onSubmit}
        className="mb-6 grid gap-3 rounded-xl border border-brand-100 bg-brand-50/30 p-4 md:grid-cols-2"
      >
        <input
          value={form.title}
          onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
          required
          placeholder="Title"
          className="focus-ring w-full rounded-lg border border-brand-200 px-3 py-2"
        />
        <input
          type="file"
          key={fileInputKey}
          accept="image/jpeg,image/png,image/webp"
          onChange={onFileChange}
          className="focus-ring w-full rounded-lg border border-brand-200 px-3 py-2"
        />
        <input
          value={form.imageUrl}
          onChange={(event) => setForm((prev) => ({ ...prev, imageUrl: event.target.value }))}
          placeholder="Image URL"
          className="focus-ring w-full rounded-lg border border-brand-200 px-3 py-2"
        />
        <textarea
          value={form.description}
          onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
          rows={3}
          placeholder="Description"
          className="focus-ring w-full rounded-lg border border-brand-200 px-3 py-2 md:col-span-2"
        />
        <div className="rounded-xl border border-dashed border-brand-200 bg-white p-4 md:col-span-2">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-brand-800">Live Preview</p>
              <p className="text-xs text-slate-500">
                JPG, PNG, or WEBP. File upload takes priority over URL.
              </p>
              <p className="mt-1 text-xs font-medium text-brand-700">
                Recommended size: 800x600 (or 400x300 minimum)
              </p>
            </div>
            {form.imageFile && (
              <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">
                {form.imageFile.name}
              </span>
            )}
          </div>
          <div className="overflow-hidden rounded-lg bg-slate-50">
            {previewSource ? (
              <div className="flex aspect-[4/3] w-full items-center justify-center">
                <ImageMedia
                  src={previewSource}
                  alt={form.title || "Gallery preview"}
                  fit="cover"
                  position="50% 50%"
                  className="h-full w-full"
                  fallback={
                    <div className="flex h-full w-full items-center justify-center px-4 text-center text-sm font-medium text-slate-500">
                      Preview not available.
                    </div>
                  }
                />
              </div>
            ) : (
              <div className="flex aspect-[4/3] items-center justify-center px-4 text-center text-sm text-slate-500">
                Select a file or paste an image URL to preview it here.
              </div>
            )}
          </div>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="focus-ring rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-70 md:col-span-2 md:w-fit"
        >
          {saving ? "Uploading..." : "Upload Image"}
        </button>
      </form>

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
      {loading && <p className="text-sm text-slate-600">Loading...</p>}

      {!loading && (
        <div className="overflow-auto rounded-xl border border-brand-100">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 bg-brand-100/90 text-left text-brand-800 backdrop-blur">
              <tr>
                <th className="px-3 py-2">Preview</th>
                <th className="px-3 py-2">Title</th>
                <th className="px-3 py-2">Description</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-brand-100">
                  <td className="px-3 py-2">
                    <ImageMedia
                      src={toAbsoluteUploadUrl(item.image_url)}
                      alt={item.title}
                      className="h-12 w-16 rounded object-cover"
                      fallback={
                        <div className="flex h-12 w-16 items-center justify-center rounded bg-brand-100 text-[10px] font-semibold text-brand-600">
                          N/A
                        </div>
                      }
                    />
                  </td>
                  <td className="px-3 py-2">{item.title}</td>
                  <td className="px-3 py-2">{item.description}</td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() => onDelete(item.id)}
                      disabled={deletingId === item.id}
                      className="focus-ring rounded border border-red-200 px-2 py-1 text-xs font-semibold text-red-600"
                    >
                      {deletingId === item.id ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-3 py-3 text-center text-slate-500">
                    No images uploaded.
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
