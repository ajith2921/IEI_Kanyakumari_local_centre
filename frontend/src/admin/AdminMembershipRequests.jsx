import { useEffect, useState } from "react";
import { adminApi, parseApiError } from "../services/api";
import EmptyState from "../components/EmptyState";
import Button from "../components/ui/Button";

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
      <h2 className="heading-h2 mb-2 font-semibold text-gray-900">Membership Requests</h2>
      <p className="mb-4 text-sm text-gray-600">Update status and maintain membership application records.</p>
      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
      {loading && <p className="text-sm text-gray-600">Loading...</p>}

      {!loading && (
        <div className="overflow-auto rounded-2xl border border-slate-200">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 bg-slate-100/95 text-left text-gray-700 backdrop-blur">
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
                <tr key={req.id} className="border-t border-slate-200">
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
                      className="input-base py-1.5"
                    >
                      {statuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <Button
                      type="button"
                      onClick={() => onDelete(req.id)}
                      disabled={deletingId === req.id}
                      variant="danger"
                      size="sm"
                    >
                      {deletingId === req.id ? "Deleting..." : "Delete"}
                    </Button>
                  </td>
                </tr>
              ))}
              {requests.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-6">
                    <EmptyState
                      title="No membership requests"
                      description="New applications will show up here for review."
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
