import { useEffect, useMemo, useState } from "react";
import EmptyState from "../components/EmptyState";
import ImageMedia from "../components/ImageMedia";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { parseApiError, toAbsoluteUploadUrl } from "../services/api";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp"];

function buildEmptyForm(fields) {
  return fields.reduce((acc, field) => {
    acc[field.name] = field.defaultValue || "";
    return acc;
  }, {});
}

function isFieldVisible(field, form) {
  if (typeof field.visibleWhen !== "function") {
    return true;
  }

  try {
    return Boolean(field.visibleWhen(form));
  } catch {
    return true;
  }
}

function isFieldRequired(field, form) {
  if (typeof field.requiredWhen === "function") {
    try {
      return Boolean(field.requiredWhen(form));
    } catch {
      return Boolean(field.required);
    }
  }

  return Boolean(field.required);
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
  const tableFields = useMemo(() => fields.filter((field) => !field.formOnly), [fields]);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [isDropActive, setIsDropActive] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [previewSource, setPreviewSource] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [extraFiles, setExtraFiles] = useState({});
  const imageFieldValue = String(form[imageFieldName] || "");
  const entityLabel = title.replace(/^Manage\s+/i, "").toLowerCase();
  const visibleFields = useMemo(
    () => fields.filter((field) => isFieldVisible(field, form)),
    [fields, form]
  );

  const getActionErrorMessage = (action, err) => {
    const details = parseApiError(err);
    return `Unable to ${action} ${entityLabel}. ${details}`;
  };

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
      setError(`Unable to load ${entityLabel}. ${parseApiError(err)}`);
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
    setExtraFiles({});
    setFileInputKey((value) => value + 1);
    setEditingId(null);
    setSuccess("");
  };

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onEdit = (item) => {
    setEditingId(item.id);
    setImageFile(null);
    setExtraFiles({});
    setFileInputKey((value) => value + 1);
    setForm(
      fields.reduce(
        (acc, field) => {
          const mappedValue =
            typeof field.mapFromItem === "function"
              ? field.mapFromItem(item)
              : item[field.name];
          acc[field.name] = mappedValue ?? "";
          return acc;
        },
        { ...emptyForm }
      )
    );
    // Scroll to the top of the form for better UX
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onDelete = async (id) => {
    const confirmDelete = window.confirm("Delete this item?");
    if (!confirmDelete) return;

    try {
      setDeletingId(id);
      await deleteItem(id);
      await loadItems();
    } catch (err) {
      setError(getActionErrorMessage("delete", err));
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

  const assignImageFile = (file) => {
    if (!file) {
      setImageFile(null);
      return;
    }

    const validationError = validateImageFile(file);
    if (validationError) {
      setError(validationError);
      setImageFile(null);
      return;
    }

    setError("");
    setImageFile(file);
  };

  const onExtraFileChange = (event) => {
    const { name, files } = event.target;
    setExtraFiles((prev) => {
      const updated = { ...prev };
      if (files && files[0]) {
        updated[name] = files[0];
      } else {
        delete updated[name];
      }
      return updated;
    });
  };

  const onImageFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    assignImageFile(file);
    if (!file) {
      event.target.value = "";
    }
  };

  const onImageDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDropActive(false);

    const file = event.dataTransfer?.files?.[0] || null;
    assignImageFile(file);
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    if (formElement && typeof formElement.checkValidity === "function") {
      if (!formElement.checkValidity()) {
        if (typeof formElement.reportValidity === "function") {
          formElement.reportValidity();
        }
        setError("Please correct the highlighted fields and try again.");
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
    }
    const trimmedForm = fields.reduce((acc, field) => {
      const value = form[field.name];
      acc[field.name] = typeof value === "string" ? value.trim() : value;
      return acc;
    }, {});

    const normalizedForm = fields.reduce((acc, field) => {
      const value = trimmedForm[field.name];
      const normalizedValue =
        typeof field.normalizeValue === "function"
          ? field.normalizeValue(value, trimmedForm)
          : value;
      acc[field.name] = typeof normalizedValue === "string" ? normalizedValue.trim() : normalizedValue;
      return acc;
    }, {});

    for (const field of fields) {
      // Use trimmedForm for visibility/requirement checks as they depend on UI state
      if (!isFieldVisible(field, trimmedForm)) {
        continue;
      }

      if (!isFieldRequired(field, trimmedForm)) {
        continue;
      }

      const value = trimmedForm[field.name];
      if (value == null || String(value).trim() === "") {
        setError(`${field.label} is required.`);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
    }

    const payloadEntries = fields
      .filter((field) => !field.excludeFromPayload && field.type !== "file")
      .map((field) => [field.name, normalizedForm[field.name]]);

    const hasExtraFiles = Object.keys(extraFiles).length > 0;

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
    setSuccess("");
    try {
      const payload = (imageUploadEnabled || hasExtraFiles)
        ? (() => {
            const data = new FormData();
            payloadEntries.forEach(([key, value]) => {
              data.append(key, value == null ? "" : value);
            });
            if (imageFile) {
              data.append(imageFileFieldName, imageFile);
            }
            Object.entries(extraFiles).forEach(([key, file]) => {
              data.append(key, file);
            });
            return data;
          })()
        : Object.fromEntries(payloadEntries);

      const response = editingId
        ? await updateItem(editingId, payload)
        : await createItem(payload);
      const savedItem = response?.data;

      if (savedItem && savedItem.id != null) {
        setItems((prev) =>
          editingId
            ? prev.map((item) => (item.id === savedItem.id ? savedItem : item))
            : [savedItem, ...prev]
        );
      }

      setSuccess(editingId ? "Item updated successfully!" : "Item created successfully!");
      
      const currentEditingId = editingId;
      resetForm();
      await loadItems();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(getActionErrorMessage(editingId ? "update" : "create", err));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h2 className="heading-h2 mb-2 font-semibold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-600">
          Add new entries with the form, then edit or delete records from the table.
        </p>
      </div>

      {success && (
        <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm font-medium text-green-700">
          {success}
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <form
        onSubmit={onSubmit}
        className="mb-6 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 md:grid-cols-2 md:p-5"
      >
        {visibleFields.map((field) => {
          const isFullWidth = Boolean(field.fullWidth) || field.type === "textarea";
          const colSpanClass = isFullWidth ? "md:col-span-2" : "";
          const fieldRequired = isFieldRequired(field, form);

          if (field.type === "textarea") {
            return (
              <Input
                key={field.name}
                as="textarea"
                label={field.label}
                containerClassName={colSpanClass}
                name={field.name}
                value={form[field.name]}
                onChange={onChange}
                rows={field.rows || 3}
                required={fieldRequired}
                minLength={field.minLength}
                maxLength={field.maxLength}
                placeholder={field.placeholder || field.label}
              />
            );
          }

          if (field.type === "select") {
            return (
              <Input
                key={field.name}
                as="select"
                label={field.label}
                containerClassName={colSpanClass}
                name={field.name}
                value={form[field.name]}
                onChange={onChange}
                required={fieldRequired}
              >
                <option value="">{field.placeholder || `Select ${field.label}`}</option>
                {(field.options || []).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Input>
            );
          }

          if (field.type === "file") {
            return (
              <div key={field.name} className={colSpanClass}>
                <label className="mb-1 block text-sm font-medium text-gray-700">{field.label}</label>
                <input
                  type="file"
                  name={field.name}
                  accept={field.accept}
                  onChange={onExtraFileChange}
                  className="input-base cursor-pointer bg-white"
                  key={`${fileInputKey}-${field.name}`}
                />
              </div>
            );
          }

          return (
            <Input
              key={field.name}
              label={field.label}
              containerClassName={colSpanClass}
              type={field.type || "text"}
              name={field.name}
              value={form[field.name]}
              onChange={onChange}
              required={fieldRequired}
              placeholder={field.placeholder || field.label}
              minLength={field.minLength}
              maxLength={field.maxLength}
              pattern={field.pattern}
              inputMode={field.inputMode}
              autoComplete={field.autoComplete}
            />
          );
        })}

        {imageUploadEnabled && (
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
            onDrop={onImageDrop}
          >
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-brand-800">Image Upload</p>
                <p className="text-xs text-slate-500">
                  Drag and drop an image or choose a file. JPG, PNG, and WEBP are supported.
                </p>
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
              className="input-base mb-3 cursor-pointer"
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
                  Drop an image here or enter an image URL to preview.
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-2 md:col-span-2">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : editingId ? "Update" : "Add"}
          </Button>
          {editingId && (
            <Button type="button" variant="secondary" onClick={resetForm}>
              Cancel Edit
            </Button>
          )}
        </div>
      </form>

      {loading && <p className="text-sm text-gray-600">Loading...</p>}

      {!loading && (
        <div className="overflow-auto rounded-2xl border border-slate-200">
          <table className="min-w-full border-collapse text-sm">
            <thead className="sticky top-0 bg-slate-100/95 text-left text-gray-700 backdrop-blur">
              <tr>
                {tableFields.map((field) => (
                  <th key={field.name} className="px-3 py-2 font-semibold">
                    {field.label}
                  </th>
                ))}
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-slate-200">
                  {tableFields.map((field) => {
                    const value = item[field.name] || "";
                    if (imageUploadEnabled && field.name === imageFieldName) {
                      return (
                        <td key={field.name} className="px-3 py-2 text-gray-700">
                          {value ? (
                            <ImageMedia
                              src={toAbsoluteUploadUrl(String(value))}
                              alt={String(item.title || item.name || "Image")}
                              position={imageThumbPosition}
                              className="h-12 w-16 rounded-lg object-cover"
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

                    if (typeof field.renderValue === "function") {
                      return (
                        <td key={field.name} className="px-3 py-2 text-gray-700">
                          {field.renderValue(value, item)}
                        </td>
                      );
                    }

                    return (
                      <td key={field.name} className="px-3 py-2 text-gray-700">
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
                  <td
                    className="px-3 py-6"
                    colSpan={tableFields.length + 1}
                  >
                    <EmptyState
                      title="No entries found"
                      description="Create your first record using the form above."
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
