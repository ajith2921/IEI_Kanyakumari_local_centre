import ResourceManager from "./ResourceManager";
import { adminApi, toAbsoluteUploadUrl } from "../services/api";

const fields = [
  { name: "title", label: "Full Title", fullWidth: true, required: true },
  { name: "short_title", label: "Short Title" },
  { name: "start_date", label: "Start Date", type: "date", required: true },
  { name: "end_date", label: "End Date", type: "date", required: true },
  { name: "registration_deadline", label: "Registration Deadline", type: "date" },
  { name: "venue", label: "Venue", required: true },
  { name: "button_text", label: "Button Text" },
  { name: "link", label: "Resource Link (PDF or page URL)" },
  { name: "image_url", label: "Image URL", hidden: false, defaultValue: "" },
  {
    name: "pdf_url",
    label: "PDF",
    hidden: true,
    defaultValue: "",
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
  { name: "pdf", label: "Conference PDF", type: "file", accept: "application/pdf", fullWidth: true, formOnly: true },
  {
    name: "status",
    label: "Status",
    type: "select",
    required: true,
    placeholder: "Select Status",
    options: [
      { label: "Active", value: "active" },
      { label: "Inactive", value: "inactive" },
      { label: "Completed", value: "completed" },
    ],
  },
  {
    name: "is_new",
    label: "Show 'NEW' badge",
    type: "select",
    placeholder: "Select",
    options: [
      { label: "Yes", value: true },
      { label: "No", value: false }
    ]
  },
  { name: "description", label: "Short Description", type: "textarea", fullWidth: true },
];

export default function AdminConference() {
  return (
    <ResourceManager
      title="Manage Conference Highlights"
      fields={fields}
      fetchList={adminApi.conferences.list}
      createItem={adminApi.conferences.create}
      updateItem={adminApi.conferences.update}
      deleteItem={adminApi.conferences.remove}
      imageUploadConfig={{
        enabled: true,
        fieldName: "image_url",
        fileFieldName: "image",
        previewAspectClass: "aspect-[16/9]",
        previewFit: "cover",
        previewPosition: "50% 35%",
        thumbPosition: "50% 35%",
        guideline: "Recommended size: 1600x900 banner image",
      }}
    />
  );
}
