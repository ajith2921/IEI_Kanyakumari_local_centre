import ResourceManager from "./ResourceManager";
import { adminApi } from "../services/api";

const fields = [
  { name: "name", label: "Name", required: true },
  { name: "username", label: "Username", required: true },
  { name: "email", label: "Email", type: "email", required: true },
  {
    name: "password",
    label: "Password",
    type: "password",
    required: false,
    formOnly: true, // Only show in the form, not in the list
    placeholder: "Leave blank to keep current password",
  },
  {
    name: "role",
    label: "Role",
    type: "select",
    required: true,
    options: [
      { label: "Admin", value: "ADMIN" },
      { label: "Super Admin", value: "SUPER_ADMIN" },
    ],
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    required: true,
    options: [
      { label: "Active", value: "active" },
      { label: "Inactive", value: "inactive" },
    ],
  },
];

export default function AdminUsers() {
  return (
    <ResourceManager
      title="Manage Admin Users"
      fields={fields}
      fetchList={adminApi.users.list}
      createItem={adminApi.users.create}
      updateItem={adminApi.users.update}
      deleteItem={adminApi.users.remove}
    />
  );
}
