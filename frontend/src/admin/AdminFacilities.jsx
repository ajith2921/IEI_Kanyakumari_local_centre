import ResourceManager from "./ResourceManager";
import { adminApi } from "../services/api";

const fields = [
  { name: "name", label: "Name", required: true },
  { name: "image_url", label: "Image URL (optional)" },
  { name: "description", label: "Description", type: "textarea" },
];

export default function AdminFacilities() {
  return (
    <ResourceManager
      title="Manage Facilities"
      fields={fields}
      fetchList={adminApi.facilities.list}
      createItem={adminApi.facilities.create}
      updateItem={adminApi.facilities.update}
      deleteItem={adminApi.facilities.remove}
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
