import { useCallback, useEffect, useMemo, useState } from "react";
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
    <section className="section-card rounded-2xl border border-brand-100 bg-white p-5">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-sm font-black text-brand-900">Member Dashboard</p>
        {isAuthenticated && (
          <button
            type="button"
            onClick={loadDashboard}
            disabled={loading}
            className="focus-ring rounded-md border border-brand-200 px-2.5 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-50 disabled:opacity-70"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        )}
      </div>

      {!isAuthenticated ? (
        <p className="text-sm text-slate-600">Sign in to view your profile and CPD summary.</p>
      ) : (
        <>
          {loading && <p className="text-sm text-slate-600">Loading member summary...</p>}
          {!loading && error && <p className="text-sm text-red-600">{error}</p>}

          {!loading && !error && (
            <>
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="rounded-lg border border-brand-100 bg-brand-50/70 px-3 py-2">
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-brand-600">
                    Membership Type
                  </p>
                  <p className="mt-1 text-sm font-semibold text-brand-900">
                    {profile?.membership_type || "N/A"}
                  </p>
                </div>
                <div className="rounded-lg border border-brand-100 bg-brand-50/70 px-3 py-2">
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-brand-600">
                    Membership No
                  </p>
                  <p className="mt-1 text-sm font-semibold text-brand-900">
                    {profile?.membership_id || "Pending"}
                  </p>
                </div>
                <div className="rounded-lg border border-brand-100 bg-brand-50/70 px-3 py-2">
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-brand-600">
                    Joined On
                  </p>
                  <p className="mt-1 text-sm font-semibold text-brand-900">
                    {formatDate(profile?.created_at)}
                  </p>
                </div>
                <div className="rounded-lg border border-brand-100 bg-brand-50/70 px-3 py-2">
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-brand-600">
                    Interest Area
                  </p>
                  <p className="mt-1 text-sm font-semibold text-brand-900">
                    {profile?.interest_area || "General Engineering"}
                  </p>
                </div>
              </div>

              <div className="mt-3 rounded-lg border border-brand-100 bg-brand-50/70 px-3 py-2">
                <p className="text-xs font-black uppercase tracking-[0.12em] text-brand-600">CPD Summary</p>
                <p className="mt-1 text-sm text-slate-700">
                  {cpdRecords.length} record(s), {totalCreditHours} credit hour(s)
                </p>
                {latestRecord && (
                  <p className="mt-1 text-xs text-slate-600">
                    Latest: {latestRecord.title} ({latestRecord.attended_on || "N/A"})
                  </p>
                )}
              </div>
            </>
          )}
        </>
      )}
    </section>
  );
}
