import ResourceManager from "./ResourceManager";
import { adminApi } from "../services/api";

const fields = [
  { name: "title", label: "Full Title", required: true, fullWidth: true },
  { name: "short_title", label: "Short Title (e.g. SUSTAIN-TECH 2026)", required: true },
  { name: "start_date", label: "Start Date", type: "date", required: true },
  { name: "end_date", label: "End Date", type: "date", required: true },
  { name: "registration_deadline", label: "Registration Deadline", type: "date", required: true },
  { name: "venue", label: "Venue", required: true },
  { name: "button_text", label: "Button Text", defaultValue: "More Details" },
  { name: "link", label: "Resource Link (PDF or page URL)", defaultValue: "/conference-overview" },
  { name: "image_url", hidden: true, defaultValue: "" },
  { name: "pdf_url", hidden: true, defaultValue: "" },
  { name: "pdf", label: "Conference PDF", type: "file", accept: "application/pdf", fullWidth: true },
  { 
    name: "status", 
    label: "Status", 
    type: "select", 
    options: [
      { label: "Active", value: "active" },
      { label: "Inactive", value: "inactive" },
      { label: "Completed", value: "completed" },
    ],
    defaultValue: "active"
  },
  { name: "is_new", label: "Show 'NEW' badge", type: "select", options: [{label: "Yes", value: true}, {label: "No", value: false}], defaultValue: true },
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
