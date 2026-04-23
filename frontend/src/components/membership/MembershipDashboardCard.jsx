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

function formatCurrency(amountCents, currency = "INR") {
  const amount = Number(amountCents || 0) / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency || "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function MembershipDashboardCard() {
  const { isAuthenticated } = useMembershipSession();
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [profile, setProfile] = useState(null);
  const [cpdRecords, setCpdRecords] = useState([]);
  const [plans, setPlans] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [invoices, setInvoices] = useState([]);

  const totalCreditHours = useMemo(
    () => cpdRecords.reduce((sum, item) => sum + Number(item.credit_hours || 0), 0),
    [cpdRecords]
  );

  const latestRecord = cpdRecords[0] || null;
  const latestInvoice = invoices[0] || null;
  const premiumPlans = useMemo(
    () => plans.filter((plan) => String(plan.code || "").toUpperCase().startsWith("PREMIUM")),
    [plans]
  );
  const activeEntitlements = useMemo(
    () =>
      (Array.isArray(subscription?.entitlements) ? subscription.entitlements : [])
        .filter((item) => Boolean(item?.is_enabled))
        .map((item) => item.label || item.key)
        .filter(Boolean),
    [subscription]
  );

  const loadDashboard = useCallback(async () => {
    if (!isAuthenticated) {
      setProfile(null);
      setCpdRecords([]);
      setPlans([]);
      setSubscription(null);
      setInvoices([]);
      setError("");
      setMessage("");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");
    try {
      const [profileResponse, cpdResponse, plansResponse, subscriptionResponse, invoicesResponse] = await Promise.all([
        publicApi.getMembershipProfile(),
        publicApi.getMembershipCpdHistory(),
        publicApi.getMembershipPremiumPlans(),
        publicApi.getMembershipSubscription(),
        publicApi.getMembershipSubscriptionInvoices(),
      ]);
      setProfile(profileResponse.data || null);
      setCpdRecords(Array.isArray(cpdResponse.data) ? cpdResponse.data : []);
      setPlans(Array.isArray(plansResponse.data) ? plansResponse.data : []);
      setSubscription(subscriptionResponse.data || null);
      setInvoices(Array.isArray(invoicesResponse.data) ? invoicesResponse.data : []);
    } catch (fetchError) {
      setError(parseApiError(fetchError));
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const startCheckout = useCallback(
    async (planCode, billingCycle) => {
      if (!isAuthenticated) {
        return;
      }

      setActionLoading(`${planCode}:${billingCycle}`);
      setError("");
      setMessage("");

      try {
        const response = await publicApi.startMembershipSubscriptionCheckout({
          plan_code: planCode,
          billing_cycle: billingCycle,
        });
        const payload = response.data || {};
        const nextSubscription = payload.subscription || null;
        const nextInvoice = payload.invoice || null;
        const checkoutReference = String(payload.checkout_reference || "");
        const checkoutUrl = String(payload.checkout_url || "");

        if (nextSubscription) {
          setSubscription(nextSubscription);
        }
        if (nextInvoice?.id) {
          setInvoices((prev) => [nextInvoice, ...prev.filter((item) => item.id !== nextInvoice.id)]);
        }

        if (checkoutUrl) {
          window.open(checkoutUrl, "_blank", "noopener,noreferrer");
        }

        setMessage(
          checkoutReference
            ? `Checkout started (${checkoutReference}). Premium access activates after payment confirmation.`
            : "Checkout started. Premium access activates after payment confirmation."
        );
      } catch (checkoutError) {
        setError(parseApiError(checkoutError));
      } finally {
        setActionLoading("");
      }
    },
    [isAuthenticated]
  );

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
            disabled={loading || Boolean(actionLoading)}
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
          {loading && (
            <div className="space-y-3">
              <div className="skeleton h-4 w-3/4 rounded-md" />
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="skeleton h-14 rounded-xl" />
                <div className="skeleton h-14 rounded-xl" />
                <div className="skeleton h-14 rounded-xl" />
                <div className="skeleton h-14 rounded-xl" />
              </div>
            </div>
          )}
          {!loading && error && <p className="text-sm text-gray-500">{error}</p>}
          {!loading && !error && message && <p className="text-sm text-[#3B82F6]">{message}</p>}

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

              <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 px-3 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
                    Premium Subscription
                  </p>
                  <span className="rounded-full border border-gray-200 bg-white px-2 py-0.5 text-xs font-semibold text-gray-700">
                    {subscription?.status ? String(subscription.status).toUpperCase() : "NONE"}
                  </span>
                </div>

                {subscription ? (
                  <p className="mt-2 text-sm text-gray-700">
                    {subscription.plan_name} ({subscription.billing_cycle})
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-gray-600">No premium subscription selected yet.</p>
                )}

                {activeEntitlements.length > 0 && (
                  <div className="mt-2 rounded-lg border border-gray-200 bg-white px-3 py-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.1em] text-gray-500">
                      Active Plan Entitlements
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {activeEntitlements.slice(0, 10).map((label) => (
                        <span
                          key={label}
                          className="inline-flex rounded-full border border-[#d3deeb] bg-[#f0f6ff] px-2 py-0.5 text-[11px] font-semibold text-[#0b3a67]"
                        >
                          {label}
                        </span>
                      ))}
                      {activeEntitlements.length > 10 && (
                        <span className="inline-flex rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[11px] text-gray-500">
                          +{activeEntitlements.length - 10} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {latestInvoice && (
                  <div className="mt-2 rounded-lg border border-gray-200 bg-white px-3 py-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.1em] text-gray-500">Latest Invoice</p>
                    <p className="mt-1 text-sm font-semibold text-gray-900">{latestInvoice.invoice_number}</p>
                    <p className="text-xs text-gray-600">
                      {formatCurrency(latestInvoice.amount_cents, latestInvoice.currency)} | {String(latestInvoice.status || "-").toUpperCase()}
                    </p>
                    <p className="text-xs text-gray-500">Due: {formatDate(latestInvoice.due_at)}</p>
                  </div>
                )}

                {premiumPlans.length > 0 && (
                  <div className="mt-3 grid gap-3">
                    {premiumPlans.map((plan) => {
                      const monthlyKey = `${plan.code}:monthly`;
                      const yearlyKey = `${plan.code}:yearly`;
                      const isMonthlyLoading = actionLoading === monthlyKey;
                      const isYearlyLoading = actionLoading === yearlyKey;

                      return (
                        <article key={plan.id} className="rounded-lg border border-gray-200 bg-white px-3 py-3">
                          <p className="text-sm font-semibold text-gray-900">{plan.name}</p>
                          <p className="mt-1 text-xs text-gray-600">{plan.description}</p>
                          <p className="mt-2 text-xs font-medium text-gray-700">
                            Monthly: {formatCurrency(plan.monthly_price_cents, plan.currency)} | Yearly: {formatCurrency(plan.yearly_price_cents, plan.currency)}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <Button
                              type="button"
                              size="sm"
                              disabled={Boolean(actionLoading)}
                              onClick={() => startCheckout(plan.code, "monthly")}
                              className="!bg-[#0b3a67] !text-white hover:!bg-[#082947]"
                            >
                              {isMonthlyLoading ? "Starting..." : "Checkout Monthly"}
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              disabled={Boolean(actionLoading)}
                              onClick={() => startCheckout(plan.code, "yearly")}
                              className="!border-[#f4c430]/60 !bg-[#f4c430] !text-[#0b3a67] hover:!bg-[#ffd34d]"
                            >
                              {isYearlyLoading ? "Starting..." : "Checkout Yearly ✦"}
                            </Button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}

                <p className="mt-2 text-xs text-gray-500">
                  Premium access is enabled only after verified payment webhook confirmation.
                </p>
              </div>
            </>
          )}
        </>
      )}
    </Card>
  );
}
