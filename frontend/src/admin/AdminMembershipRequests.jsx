import { useEffect, useState } from "react";
import { adminApi, parseApiError } from "../services/api";

const statuses = ["new", "reviewed", "approved", "rejected"];

export default function AdminMembershipRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  const loadRequests = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await adminApi.membership.list();
      setRequests(response.data || []);
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      setUpdatingStatusId(id);
      await adminApi.membership.updateStatus(id, status);
      await loadRequests();
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const onDelete = async (id) => {
    const confirmDelete = window.confirm("Delete this membership request?");
    if (!confirmDelete) return;

    try {
      setDeletingId(id);
      await adminApi.membership.remove(id);
      await loadRequests();
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <h2 className="heading-h2 mb-2 font-black text-brand-800">Membership Requests</h2>
      <p className="mb-4 text-sm text-slate-600">Update status and maintain membership application records.</p>
      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
      {loading && <p className="text-sm text-slate-600">Loading...</p>}

      {!loading && (
        <div className="overflow-auto rounded-xl border border-brand-100">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 bg-brand-100/90 text-left text-brand-800 backdrop-blur">
              <tr>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Phone</th>
                <th className="px-3 py-2">Organization</th>
                <th className="px-3 py-2">Message</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id} className="border-t border-brand-100">
                  <td className="px-3 py-2">{req.name}</td>
                  <td className="px-3 py-2">{req.email}</td>
                  <td className="px-3 py-2">{req.phone}</td>
                  <td className="max-w-[200px] whitespace-pre-wrap break-words px-3 py-2">{req.organization}</td>
                  <td className="max-w-xs whitespace-pre-wrap break-words px-3 py-2">{req.message}</td>
                  <td className="px-3 py-2">
                    <select
                      value={req.status}
                      onChange={(event) => updateStatus(req.id, event.target.value)}
                      disabled={updatingStatusId === req.id}
                      className="focus-ring rounded border border-brand-200 px-2 py-1"
                    >
                      {statuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() => onDelete(req.id)}
                      disabled={deletingId === req.id}
                      className="focus-ring rounded border border-red-200 px-2 py-1 text-xs font-semibold text-red-600"
                    >
                      {deletingId === req.id ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
              {requests.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-3 text-center text-slate-500">
                    No membership requests found.
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
