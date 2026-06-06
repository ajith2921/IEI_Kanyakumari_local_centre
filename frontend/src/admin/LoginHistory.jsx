import { useState, useEffect } from "react";
import { adminApi } from "../services/api";

export default function LoginHistory() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await adminApi.audit.loginHistory({ limit: 100 });
      setLogs(res.data?.items || []);
      setError(null);
    } catch (err) {
      setError("Failed to load login history");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Login History</h2>
        <button
          onClick={fetchLogs}
          className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-gray-900">Login Time</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-900">Admin</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-900">Status</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-900">IP Address</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-900">User Agent</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-900">Logout Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">Loading...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">No login records found.</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="whitespace-nowrap px-6 py-4 text-gray-500">
                      {new Date(log.login_time).toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900">
                      {log.admin_name || `ID: ${log.admin_id}`}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset
                        ${log.status === 'success' ? 'bg-green-50 text-green-700 ring-green-600/20' : 
                          'bg-red-50 text-red-700 ring-red-600/10'}`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-gray-500">{log.ip_address || "-"}</td>
                    <td className="px-6 py-4 text-gray-500 text-xs truncate max-w-xs" title={log.user_agent}>
                      {log.user_agent || "-"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-gray-500">
                      {log.logout_time ? new Date(log.logout_time).toLocaleString() : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
