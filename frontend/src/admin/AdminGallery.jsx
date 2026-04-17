import { useEffect, useState } from "react";
import EmptyState from "../components/EmptyState";
import { adminApi, parseApiError, toAbsoluteUploadUrl } from "../services/api";
import ImageMedia from "../components/ImageMedia";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function AdminGallery() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", imageFile: null, imageUrl: "" });
  const [isDropActive, setIsDropActive] = useState(false);
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

  const onDropImage = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDropActive(false);

    const file = event.dataTransfer?.files?.[0] || null;
    if (!file) {
      return;
    }

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setForm((prev) => ({ ...prev, imageFile: null }));
      return;
    }

    setError("");
    setForm((prev) => ({ ...prev, imageFile: file }));
  };

  return (
    <div>
      <h2 className="heading-h2 mb-2 font-semibold text-gray-900">Manage Gallery</h2>
      <p className="mb-4 text-sm text-gray-600">Upload and manage event photos for the public gallery.</p>

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
          label="Image URL"
          value={form.imageUrl}
          onChange={(event) => setForm((prev) => ({ ...prev, imageUrl: event.target.value }))}
          placeholder="Image URL"
        />
        <div
          className={`rounded-2xl border-2 border-dashed bg-white p-4 transition-all duration-300 md:col-span-2 ${
            isDropActive ? "border-brand-400 bg-brand-50/60" : "border-brand-200"
          }`}
          onDragOver={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setIsDropActive(true);
          }}
          onDragEnter={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setIsDropActive(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setIsDropActive(false);
          }}
          onDrop={onDropImage}
        >
          <p className="text-sm font-semibold text-brand-800">Image Upload</p>
          <p className="mt-1 text-xs text-slate-500">
            Drag and drop an image or choose a file. File upload takes priority over URL.
          </p>
          <input
          type="file"
          key={fileInputKey}
          accept="image/jpeg,image/png,image/webp"
          onChange={onFileChange}
            className="input-base mt-3 cursor-pointer"
          />
          {form.imageFile && (
            <span className="mt-2 inline-flex rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">
              {form.imageFile.name}
            </span>
          )}
        </div>
        <Input
          as="textarea"
          label="Description"
          containerClassName="md:col-span-2"
          value={form.description}
          onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
          rows={3}
          placeholder="Description"
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
        <Button type="submit" disabled={saving} className="md:col-span-2 md:w-fit">
          {saving ? "Uploading..." : "Upload Image"}
        </Button>
      </Card>

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
      {loading && <p className="text-sm text-gray-600">Loading...</p>}

      {!loading && (
        <div className="overflow-auto rounded-2xl border border-slate-200">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 bg-slate-100/95 text-left text-gray-700 backdrop-blur">
              <tr>
                <th className="px-3 py-2">Preview</th>
                <th className="px-3 py-2">Title</th>
                <th className="px-3 py-2">Description</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-slate-200">
                  <td className="px-3 py-2">
                    <ImageMedia
                      src={toAbsoluteUploadUrl(item.image_url)}
                      alt={item.title}
                      className="h-12 w-16 rounded-lg object-cover"
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
                    <Button
                      type="button"
                      onClick={() => onDelete(item.id)}
                      disabled={deletingId === item.id}
                      variant="danger"
                      size="sm"
                    >
                      {deletingId === item.id ? "Deleting..." : "Delete"}
                    </Button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-3 py-6">
                    <EmptyState
                      title="No gallery images"
                      description="Upload your first image to populate the gallery."
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
