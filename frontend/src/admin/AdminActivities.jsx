import ResourceManager from "./ResourceManager";
import { adminApi } from "../services/api";

const fields = [
  { name: "title", label: "Title", required: true },
  { name: "event_date", label: "Event Date" },
  { name: "image_url", label: "Image URL (optional)" },
  { name: "description", label: "Description", type: "textarea" },
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
