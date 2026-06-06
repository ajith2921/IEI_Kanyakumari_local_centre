import { useState, useEffect } from "react";
import { adminApi } from "../services/api";

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await adminApi.audit.list({ limit: 100 });
      setLogs(res.data?.items || []);
      setError(null);
    } catch (err) {
      setError("Failed to load audit logs");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">System Audit Logs</h2>
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
                <th className="px-6 py-4 text-left font-semibold text-gray-900">Date/Time</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-900">Admin</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-900">Action</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-900">Module</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-900">Record ID</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-900">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">Loading...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">No logs found.</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="whitespace-nowrap px-6 py-4 text-gray-500">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900">
                      {log.admin_name || `ID: ${log.admin_id}`}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset
                        ${log.action === 'CREATE' ? 'bg-green-50 text-green-700 ring-green-600/20' : 
                          log.action === 'UPDATE' ? 'bg-blue-50 text-blue-700 ring-blue-600/20' : 
                          log.action === 'DELETE' ? 'bg-red-50 text-red-700 ring-red-600/10' : 
                          'bg-gray-50 text-gray-600 ring-gray-500/10'}`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-gray-500">{log.module}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-gray-500">{log.record_id || "-"}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-gray-500">{log.ip_address || "-"}</td>
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
