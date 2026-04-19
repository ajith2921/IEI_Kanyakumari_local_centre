import ResourceManager from "./ResourceManager";
import { adminApi } from "../services/api";

const DIVISION_MEMBER_SUFFIX = "Committee Member";

const ENGINEERING_DIVISIONS = [
  "Civil Engineering Division",
  "Electrical Engineering Division",
  "Mechanical Engineering Division",
  "Computer / IT Division",
  "Electronics & Communication Division",
  "Chemical Engineering Division",
  "Environmental Engineering Division",
  "Applied Science / Management",
];

function extractDivisionFromPosition(position) {
  const cleaned = String(position || "").trim();
  const match = cleaned.match(/^(.*)\s+Committee Member$/i);
  if (!match) {
    return "";
  }

  return match[1].trim();
}

function isDivisionMemberPosition(position) {
  return Boolean(extractDivisionFromPosition(position));
}

const fields = [
  {
    name: "position",
    label: "Position",
    type: "select",
    required: true,
    mapFromItem: (item) => (isDivisionMemberPosition(item.position) ? "Member" : item.position || ""),
    normalizeValue: (value, form) => {
      const selectedPosition = String(value || "").trim();
      if (selectedPosition !== "Member") {
        return selectedPosition;
      }

      const selectedDivision = String(form.engineering_division || "").trim();
      if (!selectedDivision) {
        return selectedPosition;
      }

      return `${selectedDivision} ${DIVISION_MEMBER_SUFFIX}`;
    },
    options: [
      { label: "Chairman", value: "Chairman" },
      { label: "Secretary", value: "Secretary" },
      { label: "Treasurer", value: "Treasurer" },
      { label: "Joint Secretary", value: "Joint Secretary" },
      { label: "Executive Member", value: "Executive Member" },
      { label: "Member", value: "Member" },
    ],
  },
  {
    name: "engineering_division",
    label: "Engineering Division",
    type: "select",
    placeholder: "Select Engineering Division",
    formOnly: true,
    excludeFromPayload: true,
    visibleWhen: (form) => String(form.position || "") === "Member",
    requiredWhen: (form) => String(form.position || "") === "Member",
    mapFromItem: (item) => extractDivisionFromPosition(item.position),
    options: ENGINEERING_DIVISIONS.map((division) => ({
      label: division,
      value: division,
    })),
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
