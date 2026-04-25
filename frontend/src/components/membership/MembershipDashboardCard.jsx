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

function normalizeStatus(value) {
  return String(value || "").trim().toLowerCase();
}

function getAnnualSavingsPercent(monthlyCents, yearlyCents) {
  const monthly = Number(monthlyCents || 0);
  const yearly = Number(yearlyCents || 0);
  if (monthly <= 0 || yearly <= 0) {
    return 0;
  }

  const annualMonthlyCost = monthly * 12;
  if (yearly >= annualMonthlyCost) {
    return 0;
  }

  return Math.round(((annualMonthlyCost - yearly) / annualMonthlyCost) * 100);
}

function resolveSubscriptionState(subscription, latestInvoice) {
  if (!subscription) {
    return {
      key: "none",
      label: "No Active Plan",
      description: "Select a premium plan to unlock advanced member services.",
      chipClass: "border-gray-200 bg-white text-gray-700",
      panelClass: "border-gray-200 bg-gray-50 text-gray-700",
    };
  }

  const subscriptionStatus = normalizeStatus(subscription.status);
  const invoiceStatus = normalizeStatus(latestInvoice?.status);

  if (subscriptionStatus === "active" || subscriptionStatus === "trialing") {
    return {
      key: "active",
      label: "Premium Active",
      description: "Your premium entitlements are enabled and available.",
      chipClass: "border-emerald-200 bg-emerald-50 text-emerald-700",
      panelClass: "border-emerald-200 bg-emerald-50/60 text-emerald-900",
    };
  }

  if (subscriptionStatus === "past_due") {
    return {
      key: "past_due",
      label: "Payment Overdue",
      description: "Access is in grace mode. Complete payment to avoid interruption.",
      chipClass: "border-amber-200 bg-amber-50 text-amber-700",
      panelClass: "border-amber-200 bg-amber-50/60 text-amber-900",
    };
  }

  if (subscriptionStatus === "pending") {
    return {
      key: "pending",
      label: invoiceStatus === "pending" ? "Awaiting Payment" : "Activation Pending",
      description:
        invoiceStatus === "pending"
          ? "Finish checkout to activate premium access."
          : "Payment is being verified. Access activates after confirmation.",
      chipClass: "border-sky-200 bg-sky-50 text-sky-700",
      panelClass: "border-sky-200 bg-sky-50/60 text-sky-900",
    };
  }

  if (subscriptionStatus === "suspended") {
    return {
      key: "suspended",
      label: "Subscription Suspended",
      description: "Contact support to restore premium privileges.",
      chipClass: "border-rose-200 bg-rose-50 text-rose-700",
      panelClass: "border-rose-200 bg-rose-50/60 text-rose-900",
    };
  }

  if (subscriptionStatus === "cancelled" || subscriptionStatus === "expired") {
    return {
      key: "inactive",
      label: "Plan Inactive",
      description: "Reactivate with a premium checkout plan to continue benefits.",
      chipClass: "border-gray-300 bg-gray-100 text-gray-700",
      panelClass: "border-gray-300 bg-gray-100 text-gray-700",
    };
  }

  return {
    key: "unknown",
    label: "Status Update Needed",
    description: "Refresh dashboard to sync the latest subscription status.",
    chipClass: "border-gray-200 bg-white text-gray-700",
    panelClass: "border-gray-200 bg-gray-50 text-gray-700",
  };
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
  const subscriptionStatus = normalizeStatus(subscription?.status);
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
  const subscriptionState = useMemo(
    () => resolveSubscriptionState(subscription, latestInvoice),
    [subscription, latestInvoice]
  );
  const recommendedPlan = useMemo(() => {
    if (!premiumPlans.length) {
      return null;
    }

    return premiumPlans.reduce((bestPlan, plan) => {
      if (!bestPlan) {
        return plan;
      }

      const currentSavings = getAnnualSavingsPercent(plan.monthly_price_cents, plan.yearly_price_cents);
      const bestSavings = getAnnualSavingsPercent(bestPlan.monthly_price_cents, bestPlan.yearly_price_cents);
      return currentSavings > bestSavings ? plan : bestPlan;
    }, null);
  }, [premiumPlans]);

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

  const handleRecoveryAction = useCallback(async () => {
    if (!isAuthenticated || !premiumPlans.length || Boolean(actionLoading)) {
      return;
    }

    const currentPlan = premiumPlans.find(
      (plan) => String(plan.code || "").toUpperCase() === String(subscription?.plan_code || "").toUpperCase()
    );

    if (subscriptionStatus === "pending" && currentPlan) {
      await startCheckout(currentPlan.code, subscription?.billing_cycle === "monthly" ? "monthly" : "yearly");
      return;
    }

    if (recommendedPlan) {
      await startCheckout(recommendedPlan.code, "yearly");
      return;
    }

    await startCheckout(premiumPlans[0].code, "yearly");
  }, [
    actionLoading,
    isAuthenticated,
    premiumPlans,
    recommendedPlan,
    startCheckout,
    subscription?.billing_cycle,
    subscription?.plan_code,
    subscriptionStatus,
  ]);

  const recoveryActionLabel = useMemo(() => {
    if (!isAuthenticated || !premiumPlans.length) {
      return "";
    }

    if (subscriptionStatus === "pending") {
      return "Resume Checkout";
    }
    if (subscriptionStatus === "past_due") {
      return "Pay And Restore Access";
    }
    if (subscriptionStatus === "suspended") {
      return "Restart Premium Plan";
    }
    if (subscriptionStatus === "cancelled" || subscriptionStatus === "expired" || subscriptionStatus === "none") {
      return "Activate Premium";
    }
    return "";
  }, [isAuthenticated, premiumPlans.length, subscriptionStatus]);

  const showRecoveryAction =
    Boolean(recoveryActionLabel) &&
    ["pending", "past_due", "suspended", "cancelled", "expired", "none"].includes(
      subscriptionStatus || "none"
    );

  return (
    <Card as="section" className="border border-gray-200 bg-white p-5" padded={false}>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <p className="text-sm font-medium text-gray-900">Member Dashboard</p>
          {isAuthenticated && (
            <span
              className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${subscriptionState.chipClass}`}
            >
              {subscriptionState.label}
            </span>
          )}
        </div>
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
                  <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${subscriptionState.chipClass}`}>
                    {subscriptionState.label}
                  </span>
                </div>

                <div className={`mt-2 rounded-lg border px-3 py-2 ${subscriptionState.panelClass}`}>
                  <p className="text-sm font-semibold">
                    {subscription ? `${subscription.plan_name} (${subscription.billing_cycle})` : "No subscription selected"}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed">{subscriptionState.description}</p>
                  {subscription && (
                    <div className="mt-2 grid gap-2 text-xs sm:grid-cols-2">
                      <p>
                        Status: <span className="font-semibold">{String(subscription.status || "-").toUpperCase()}</span>
                      </p>
                      <p>
                        Current Period End: <span className="font-semibold">{formatDate(subscription.current_period_end)}</span>
                      </p>
                    </div>
                  )}
                </div>

                {showRecoveryAction && (
                  <div className="mt-2 rounded-lg border border-[#f4c430]/45 bg-[#fff8dc] px-3 py-2.5">
                    <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#7a5b00]">
                      Subscription Recovery
                    </p>
                    <p className="mt-1 text-sm text-[#6c5b20]">
                      {subscriptionStatus === "pending"
                        ? "Your checkout is not yet completed. Resume to activate premium access."
                        : subscriptionStatus === "past_due"
                          ? "Your plan is in grace mode. Complete payment now to avoid interruption."
                          : subscriptionStatus === "suspended"
                            ? "Your premium benefits are paused. Start a new checkout to restore access."
                            : "Activate a premium plan to unlock member intelligence and advanced services."}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleRecoveryAction}
                        disabled={Boolean(actionLoading)}
                        className="!bg-[#f4c430] !text-[#0b3a67] hover:!bg-[#ffd34d]"
                      >
                        {actionLoading ? "Starting..." : recoveryActionLabel}
                      </Button>
                      <Button as="a" href="#auth-panel" variant="secondary" size="sm">
                        Open Member Access
                      </Button>
                    </div>
                  </div>
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
                      const isCurrentPlan =
                        String(subscription?.plan_code || "").toUpperCase() ===
                        String(plan.code || "").toUpperCase();
                      const isCurrentMonthly = isCurrentPlan && subscription?.billing_cycle === "monthly";
                      const isCurrentYearly = isCurrentPlan && subscription?.billing_cycle === "yearly";
                      const isActiveLike = ["active", "trialing", "past_due"].includes(subscriptionStatus);

                      return (
                        <article key={plan.id} className="rounded-lg border border-gray-200 bg-white px-3 py-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-gray-900">{plan.name}</p>
                            {isCurrentPlan && (
                              <span className="rounded-full border border-[#d3deeb] bg-[#f0f6ff] px-2 py-0.5 text-[11px] font-semibold text-[#0b3a67]">
                                Current Plan
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-xs text-gray-600">{plan.description}</p>
                          <p className="mt-2 text-xs font-medium text-gray-700">
                            Monthly: {formatCurrency(plan.monthly_price_cents, plan.currency)} | Yearly: {formatCurrency(plan.yearly_price_cents, plan.currency)}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <Button
                              type="button"
                              size="sm"
                              disabled={Boolean(actionLoading) || (isCurrentMonthly && isActiveLike)}
                              onClick={() => startCheckout(plan.code, "monthly")}
                              className="!bg-[#0b3a67] !text-white hover:!bg-[#082947]"
                            >
                              {isMonthlyLoading
                                ? "Starting..."
                                : isCurrentMonthly && subscriptionStatus === "pending"
                                  ? "Resume Monthly Checkout"
                                  : isCurrentMonthly && isActiveLike
                                    ? "Current Monthly Plan"
                                    : "Checkout Monthly"}
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              disabled={Boolean(actionLoading) || (isCurrentYearly && isActiveLike)}
                              onClick={() => startCheckout(plan.code, "yearly")}
                              className="!border-[#f4c430]/60 !bg-[#f4c430] !text-[#0b3a67] hover:!bg-[#ffd34d]"
                            >
                              {isYearlyLoading
                                ? "Starting..."
                                : isCurrentYearly && subscriptionStatus === "pending"
                                  ? "Resume Yearly Checkout"
                                  : isCurrentYearly && isActiveLike
                                    ? "Current Yearly Plan"
                                    : "Checkout Yearly"}
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

