import ResourceManager from "./ResourceManager";
import { adminApi } from "../services/api";

const fields = [
  {
    name: "position",
    label: "Position",
    type: "select",
    required: true,
    options: [
      { label: "Chairman", value: "Chairman" },
      { label: "Secretary", value: "Secretary" },
      { label: "Treasurer", value: "Treasurer" },
      { label: "Joint Secretary", value: "Joint Secretary" },
      { label: "Executive Member", value: "Executive Member" },
      { label: "Member", value: "Member" },
    ],
  },
  { name: "name", label: "Name", required: true },
  { name: "membership_id", label: "Membership ID" },
  { name: "address", label: "Address", type: "textarea", required: true, rows: 3, fullWidth: true },
  { name: "email", label: "Email", type: "email", required: true, autoComplete: "email" },
  {
    name: "mobile",
    label: "Mobile Number",
    type: "tel",
    required: true,
    inputMode: "tel",
    pattern: "[+0-9\\s()\\-]{7,18}",
  },
  { name: "image_url", label: "Image URL (optional)" },
];

export default function AdminMembers() {
  return (
    <ResourceManager
      title="Manage Members"
      fields={fields}
      fetchList={adminApi.members.list}
      createItem={adminApi.members.create}
      updateItem={adminApi.members.update}
      deleteItem={adminApi.members.remove}
      imageUploadConfig={{
        enabled: true,
        fieldName: "image_url",
        fileFieldName: "image",
        previewAspectClass: "aspect-square",
        previewFit: "cover",
        previewPosition: "50% 20%",
        thumbPosition: "50% 20%",
        guideline: "Recommended size: 400x400 square (face centered near top)",
      }}
    />
  );
}
