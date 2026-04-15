import { useEffect, useMemo, useState } from "react";
import ImageMedia from "../components/ImageMedia";
import { parseApiError, toAbsoluteUploadUrl } from "../services/api";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp"];

function buildEmptyForm(fields) {
  return fields.reduce((acc, field) => {
    acc[field.name] = field.defaultValue || "";
    return acc;
  }, {});
}

export default function ResourceManager({
  title,
  fields,
  fetchList,
  createItem,
  updateItem,
  deleteItem,
  imageUploadConfig = null,
}) {
  const imageUploadEnabled = Boolean(imageUploadConfig?.enabled);
  const imageFieldName = imageUploadConfig?.fieldName || "image_url";
  const imageFileFieldName = imageUploadConfig?.fileFieldName || "image";
  const imageRequired = Boolean(imageUploadConfig?.required);
  const imagePreviewAspectClass = imageUploadConfig?.previewAspectClass || "aspect-[4/3]";
  const imagePreviewFit = imageUploadConfig?.previewFit || "cover";
  const imagePreviewPosition = imageUploadConfig?.previewPosition || "50% 50%";
  const imageThumbPosition = imageUploadConfig?.thumbPosition || imagePreviewPosition;
  const imageGuideline = imageUploadConfig?.guideline || "Recommended size: 400x300";

  const emptyForm = useMemo(() => buildEmptyForm(fields), [fields]);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [previewSource, setPreviewSource] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const imageFieldValue = String(form[imageFieldName] || "");

  useEffect(() => {
    if (!imageUploadEnabled) {
      setPreviewSource("");
      return undefined;
    }

    if (imageFile) {
      const objectUrl = URL.createObjectURL(imageFile);
      setPreviewSource(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }

    setPreviewSource(imageFieldValue.trim());
    return undefined;
  }, [imageUploadEnabled, imageFieldValue, imageFile]);

  const loadItems = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetchList();
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
    setForm(emptyForm);
    setImageFile(null);
    setFileInputKey((value) => value + 1);
    setEditingId(null);
  };

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onEdit = (item) => {
    setEditingId(item.id);
    setImageFile(null);
    setFileInputKey((value) => value + 1);
    setForm(
      fields.reduce((acc, field) => {
        acc[field.name] = item[field.name] || "";
        return acc;
      }, {})
    );
  };

  const onDelete = async (id) => {
    const confirmDelete = window.confirm("Delete this item?");
    if (!confirmDelete) return;

    try {
      setDeletingId(id);
      await deleteItem(id);
      await loadItems();
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setDeletingId(null);
    }
  };

  const validateImageFile = (file) => {
    const extension = file.name.split(".").pop()?.toLowerCase() || "";
    const validMimeType = ALLOWED_IMAGE_TYPES.includes(file.type);
    const validExtension = ALLOWED_IMAGE_EXTENSIONS.includes(extension);

    if (!validMimeType && !validExtension) {
      return "Only JPG, PNG, and WEBP images are allowed.";
    }
    return "";
  };

  const onImageFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    if (!file) {
      setImageFile(null);
      return;
    }

    const validationError = validateImageFile(file);
    if (validationError) {
      setError(validationError);
      event.target.value = "";
      setImageFile(null);
      return;
    }

    setError("");
    setImageFile(file);
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    const normalizedForm = fields.reduce((acc, field) => {
      const value = form[field.name];
      acc[field.name] = typeof value === "string" ? value.trim() : value;
      return acc;
    }, {});

    if (imageUploadEnabled) {
      const imageUrl = String(normalizedForm[imageFieldName] || "").trim();

      if (imageRequired && !imageFile && !imageUrl) {
        setError("Please upload an image file or provide an image URL.");
        return;
      }

      if (imageFile) {
        const validationError = validateImageFile(imageFile);
        if (validationError) {
          setError(validationError);
          return;
        }
      }
    }

    setSaving(true);
    setError("");
    try {
      const payload = imageUploadEnabled
        ? (() => {
            const data = new FormData();
            Object.entries(normalizedForm).forEach(([key, value]) => {
              data.append(key, value == null ? "" : value);
            });
            if (imageFile) {
              data.append(imageFileFieldName, imageFile);
            }
            return data;
          })()
        : normalizedForm;

      if (editingId) {
        await updateItem(editingId, payload);
      } else {
        await createItem(payload);
      }
      resetForm();
      await loadItems();
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h2 className="heading-h2 mb-2 font-black text-brand-800">{title}</h2>
        <p className="text-sm text-slate-600">
          Add new entries with the form, then edit or delete records from the table.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="mb-6 grid gap-3 rounded-xl border border-brand-100 bg-brand-50/30 p-4 md:grid-cols-2"
      >
        {fields.map((field) => {
          const isFullWidth = Boolean(field.fullWidth) || field.type === "textarea";
          const colSpanClass = isFullWidth ? "md:col-span-2" : "";
          const baseClass = `focus-ring w-full rounded-lg border border-brand-200 px-3 py-2 ${colSpanClass}`.trim();

          if (field.type === "textarea") {
            return (
              <textarea
                key={field.name}
                name={field.name}
                value={form[field.name]}
                onChange={onChange}
                rows={field.rows || 3}
                required={Boolean(field.required)}
                minLength={field.minLength}
                maxLength={field.maxLength}
                placeholder={field.label}
                className={baseClass}
              />
            );
          }

          if (field.type === "select") {
            return (
              <select
                key={field.name}
                name={field.name}
                value={form[field.name]}
                onChange={onChange}
                required={Boolean(field.required)}
                className={baseClass}
              >
                <option value="">{field.placeholder || `Select ${field.label}`}</option>
                {(field.options || []).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            );
          }

          return (
            <input
              key={field.name}
              type={field.type || "text"}
              name={field.name}
              value={form[field.name]}
              onChange={onChange}
              required={Boolean(field.required)}
              placeholder={field.label}
              minLength={field.minLength}
              maxLength={field.maxLength}
              pattern={field.pattern}
              inputMode={field.inputMode}
              autoComplete={field.autoComplete}
              className={baseClass}
            />
          );
        })}

        {imageUploadEnabled && (
          <div className="rounded-xl border border-dashed border-brand-200 bg-white p-4 md:col-span-2">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-brand-800">Image Upload</p>
                <p className="text-xs text-slate-500">JPG, PNG, or WEBP. File upload overrides URL.</p>
                <p className="mt-1 text-xs font-medium text-brand-700">{imageGuideline}</p>
              </div>
              {imageFile && (
                <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">
                  {imageFile.name}
                </span>
              )}
            </div>
            <input
              type="file"
              key={fileInputKey}
              accept="image/jpeg,image/png,image/webp"
              onChange={onImageFileChange}
              className="focus-ring mb-3 w-full rounded-lg border border-brand-200 px-3 py-2"
            />
            <div className="overflow-hidden rounded-lg bg-slate-50">
              {previewSource ? (
                <div className={`flex w-full items-center justify-center ${imagePreviewAspectClass}`}>
                  <ImageMedia
                    src={toAbsoluteUploadUrl(previewSource)}
                    alt="Resource preview"
                    fit={imagePreviewFit}
                    position={imagePreviewPosition}
                    className="h-full w-full"
                    fallback={
                      <div className="flex h-full w-full items-center justify-center px-4 text-center text-sm text-slate-500">
                        Preview unavailable.
                      </div>
                    }
                  />
                </div>
              ) : (
                <div className="flex aspect-[4/3] items-center justify-center px-4 text-center text-sm text-slate-500">
                  Select an image file or enter an image URL to preview.
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-2 md:col-span-2">
          <button
            type="submit"
            disabled={saving}
            className="focus-ring rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-70"
          >
            {saving ? "Saving..." : editingId ? "Update" : "Add"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="focus-ring rounded-lg border border-brand-200 px-4 py-2 text-sm font-semibold text-brand-700"
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
          <table className="min-w-full border-collapse text-sm">
            <thead className="sticky top-0 bg-brand-100/90 text-left text-brand-800 backdrop-blur">
              <tr>
                {fields.map((field) => (
                  <th key={field.name} className="px-3 py-2 font-semibold">
                    {field.label}
                  </th>
                ))}
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-brand-100">
                  {fields.map((field) => {
                    const value = item[field.name] || "";
                    if (imageUploadEnabled && field.name === imageFieldName) {
                      return (
                        <td key={field.name} className="px-3 py-2 text-slate-700">
                          {value ? (
                            <ImageMedia
                              src={toAbsoluteUploadUrl(String(value))}
                              alt={String(item.title || item.name || "Image")}
                              position={imageThumbPosition}
                              className="h-12 w-16 rounded object-cover"
                              fallback={
                                <div className="flex h-12 w-16 items-center justify-center rounded bg-brand-100 text-[10px] font-semibold text-brand-600">
                                  N/A
                                </div>
                              }
                            />
                          ) : (
                            <span className="text-xs text-slate-500">No image</span>
                          )}
                        </td>
                      );
                    }

                    return (
                      <td key={field.name} className="px-3 py-2 text-slate-700">
                        <span
                          className={field.type === "textarea" ? "line-clamp-3 whitespace-pre-wrap break-words" : "break-words"}
                        >
                          {String(value)}
                        </span>
                      </td>
                    );
                  })}
                  <td className="px-3 py-2">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(item)}
                        className="focus-ring rounded border border-brand-200 px-2 py-1 text-xs font-semibold text-brand-700"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(item.id)}
                        disabled={deletingId === item.id}
                        className="focus-ring rounded border border-red-200 px-2 py-1 text-xs font-semibold text-red-600"
                      >
                        {deletingId === item.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td
                    className="px-3 py-3 text-center text-slate-500"
                    colSpan={fields.length + 1}
                  >
                    No entries found.
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
