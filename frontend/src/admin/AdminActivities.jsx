import ResourceManager from "./ResourceManager";
import { adminApi, toAbsoluteUploadUrl } from "../services/api";

const fields = [
  { name: "title", label: "Title", required: true },
  { name: "event_date", label: "Event Date", type: "date" },
  { name: "image_url", label: "Image URL (optional)" },
  { name: "description", label: "Description", type: "textarea" },
  {
    name: "pdf_url",
    label: "PDF",
    hidden: true,
    renderValue: (value) =>
      value ? (
        <a
          href={toAbsoluteUploadUrl(String(value))}
          target="_blank"
          rel="noreferrer"
          className="text-brand-700 underline"
        >
          Open
        </a>
      ) : (
        "N/A"
      ),
  },

  { name: "pdf", label: "Upload PDF", type: "file", accept: ".pdf", formOnly: true },
];

export default function AdminActivities() {
  return (
    <ResourceManager
      title="Manage Activities"
      fields={fields}
      fetchList={adminApi.activities.list}
      createItem={adminApi.activities.create}
      updateItem={adminApi.activities.update}
      deleteItem={adminApi.activities.remove}
      imageUploadConfig={{
        enabled: true,
        fieldName: "image_url",
        fileFieldName: "image",
        previewAspectClass: "aspect-[4/3]",
        previewFit: "cover",
        previewPosition: "50% 50%",
        guideline: "Recommended size: 400x300",
      }}
    />
  );
}
