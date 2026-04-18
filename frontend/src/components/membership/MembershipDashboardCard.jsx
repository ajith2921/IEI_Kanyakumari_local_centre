import { useCallback, useEffect, useMemo, useState } from "react";
import Button from "../ui/Button";
import Card from "../ui/Card";
import { useMembershipSession } from "../../context/MembershipSessionContext";
import { parseApiError, publicApi } from "../../services/api";

function formatDate(value) {
  if (!value) {
    return "N/A";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "N/A";
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function MembershipDashboardCard() {
  const { isAuthenticated } = useMembershipSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState(null);
  const [cpdRecords, setCpdRecords] = useState([]);

  const totalCreditHours = useMemo(
    () => cpdRecords.reduce((sum, item) => sum + Number(item.credit_hours || 0), 0),
    [cpdRecords]
  );

  const latestRecord = cpdRecords[0] || null;

  const loadDashboard = useCallback(async () => {
    if (!isAuthenticated) {
      setProfile(null);
      setCpdRecords([]);
      setError("");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const [profileResponse, cpdResponse] = await Promise.all([
        publicApi.getMembershipProfile(),
        publicApi.getMembershipCpdHistory(),
      ]);
      setProfile(profileResponse.data || null);
      setCpdRecords(Array.isArray(cpdResponse.data) ? cpdResponse.data : []);
    } catch (fetchError) {
      setError(parseApiError(fetchError));
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  return (
    <Card as="section" className="border border-gray-200 bg-white p-5" padded={false}>
      <div className="mb-2 flex items-center justify-between gap-4">
        <p className="text-sm font-medium text-gray-900">Member Dashboard</p>
        {isAuthenticated && (
          <Button
            type="button"
            onClick={loadDashboard}
            disabled={loading}
            variant="secondary"
            size="sm"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
        )}
      </div>

      {!isAuthenticated ? (
        <p className="text-sm text-gray-600">Sign in to view your profile and CPD summary.</p>
      ) : (
        <>
          {loading && <p className="text-sm text-gray-600">Loading member summary...</p>}
          {!loading && error && <p className="text-sm text-gray-500">{error}</p>}

          {!loading && !error && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
                    Membership Type
                  </p>
                  <p className="mt-1 text-sm font-semibold text-gray-900">
                    {profile?.membership_type || "N/A"}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
                    Membership No
                  </p>
                  <p className="mt-1 text-sm font-semibold text-gray-900">
                    {profile?.membership_id || "Pending"}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
                    Joined On
                  </p>
                  <p className="mt-1 text-sm font-semibold text-gray-900">
                    {formatDate(profile?.created_at)}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
                    Interest Area
                  </p>
                  <p className="mt-1 text-sm font-semibold text-gray-900">
                    {profile?.interest_area || "General Engineering"}
                  </p>
                </div>
              </div>

              <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">CPD Summary</p>
                <p className="mt-1 text-sm text-gray-600">
                  {cpdRecords.length} record(s), {totalCreditHours} credit hour(s)
                </p>
                {latestRecord && (
                  <p className="mt-1 text-xs text-gray-600">
                    Latest: {latestRecord.title} ({latestRecord.attended_on || "N/A"})
                  </p>
                )}
              </div>
            </>
          )}
        </>
      )}
    </Card>
  );
}
