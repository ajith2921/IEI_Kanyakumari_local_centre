import { useCallback, useEffect, useState } from "react";
import Button from "../components/ui/Button";
import { adminApi, parseApiError } from "../services/api";

const subscriptionStatuses = [
  "pending",
  "trialing",
  "active",
  "past_due",
  "suspended",
  "cancelled",
  "expired",
];

const invoiceStatuses = [
  "pending",
  "paid",
  "failed",
  "cancelled",
  "expired",
  "refunded",
  "past_due",
];

function formatDateTime(value) {
  if (!value) {
    return "-";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }

  return parsed.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCurrency(amountCents, currency = "INR") {
  const amount = Number(amountCents || 0) / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function AdminPremiumSubscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [events, setEvents] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [subscriptionFilter, setSubscriptionFilter] = useState("");
  const [invoiceFilter, setInvoiceFilter] = useState("");
  const [eventProviderFilter, setEventProviderFilter] = useState("");
  const [eventStatusFilter, setEventStatusFilter] = useState("");
  const [eventTypeFilter, setEventTypeFilter] = useState("");
  const [eventInvoiceFilter, setEventInvoiceFilter] = useState("");
  const [eventSubscriptionFilter, setEventSubscriptionFilter] = useState("");
  const [eventProcessedFromFilter, setEventProcessedFromFilter] = useState("");
  const [eventProcessedToFilter, setEventProcessedToFilter] = useState("");
  const [subscriptionDrafts, setSubscriptionDrafts] = useState({});
  const [invoiceDrafts, setInvoiceDrafts] = useState({});
  const [savingSubscriptionId, setSavingSubscriptionId] = useState(null);
  const [savingInvoiceId, setSavingInvoiceId] = useState(null);
  const [renewingSubscriptionId, setRenewingSubscriptionId] = useState(null);
  const [refundingInvoiceId, setRefundingInvoiceId] = useState(null);
  const [exportingEvents, setExportingEvents] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    setActionMessage("");

    try {
      const eventFilters = {
        limit: 80,
        provider: eventProviderFilter,
        status: eventStatusFilter,
        event_type: eventTypeFilter,
        invoice_number: eventInvoiceFilter,
        subscription_id: eventSubscriptionFilter,
        processed_from: eventProcessedFromFilter,
        processed_to: eventProcessedToFilter,
      };

      const [
        subscriptionResponse,
        invoiceResponse,
        metricsResponse,
        eventsResponse,
      ] = await Promise.all([
        adminApi.premium.listSubscriptions(subscriptionFilter),
        adminApi.premium.listInvoices(invoiceFilter),
        adminApi.premium.getMetrics(),
        adminApi.premium.getEvents(eventFilters),
      ]);

      const nextSubscriptions = Array.isArray(subscriptionResponse.data)
        ? subscriptionResponse.data
        : [];
      const nextInvoices = Array.isArray(invoiceResponse.data) ? invoiceResponse.data : [];

      setSubscriptions(nextSubscriptions);
      setInvoices(nextInvoices);
      setMetrics(metricsResponse.data || null);
      setEvents(Array.isArray(eventsResponse.data) ? eventsResponse.data : []);

      setSubscriptionDrafts(
        nextSubscriptions.reduce((acc, row) => {
          acc[row.id] = {
            status: row.status || "pending",
            cancel_at_period_end: Boolean(row.cancel_at_period_end),
          };
          return acc;
        }, {})
      );

      setInvoiceDrafts(
        nextInvoices.reduce((acc, row) => {
          acc[row.id] = {
            status: row.status || "pending",
            payment_reference: row.payment_reference || "",
          };
          return acc;
        }, {})
      );
    } catch (fetchError) {
      setError(parseApiError(fetchError));
    } finally {
      setLoading(false);
    }
  }, [
    eventInvoiceFilter,
    eventProcessedFromFilter,
    eventProcessedToFilter,
    eventProviderFilter,
    eventStatusFilter,
    eventSubscriptionFilter,
    eventTypeFilter,
    invoiceFilter,
    subscriptionFilter,
  ]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const saveSubscription = async (id) => {
    const draft = subscriptionDrafts[id];
    if (!draft) {
      return;
    }

    try {
      setSavingSubscriptionId(id);
      setError("");
      setActionMessage("");
      await adminApi.premium.updateSubscriptionStatus(id, {
        status: draft.status,
        cancel_at_period_end: Boolean(draft.cancel_at_period_end),
      });
      setActionMessage("Subscription status updated.");
      await loadData();
    } catch (updateError) {
      setError(parseApiError(updateError));
    } finally {
      setSavingSubscriptionId(null);
    }
  };

  const saveInvoice = async (id) => {
    const draft = invoiceDrafts[id];
    if (!draft) {
      return;
    }

    try {
      setSavingInvoiceId(id);
      setError("");
      setActionMessage("");
      await adminApi.premium.updateInvoiceStatus(id, {
        status: draft.status,
        payment_reference: draft.payment_reference || "",
      });
      setActionMessage("Invoice status updated.");
      await loadData();
    } catch (updateError) {
      setError(parseApiError(updateError));
    } finally {
      setSavingInvoiceId(null);
    }
  };

  const renewSubscription = async (row, activateNow) => {
    const prompt = activateNow
      ? "Renew this subscription and activate immediately?"
      : "Create a renewal invoice for this subscription?";
    if (!window.confirm(prompt)) {
      return;
    }

    try {
      setRenewingSubscriptionId(row.id);
      setError("");
      setActionMessage("");

      const response = await adminApi.premium.renewSubscription(row.id, {
        billing_cycle: row.billing_cycle || "monthly",
        activate_now: Boolean(activateNow),
      });

      setActionMessage(response.data?.message || "Subscription renewal processed.");
      await loadData();
    } catch (renewError) {
      setError(parseApiError(renewError));
    } finally {
      setRenewingSubscriptionId(null);
    }
  };

  const refundInvoice = async (row) => {
    if (!window.confirm(`Refund invoice ${row.invoice_number}?`)) {
      return;
    }

    try {
      setRefundingInvoiceId(row.id);
      setError("");
      setActionMessage("");

      const draft = invoiceDrafts[row.id] || {};
      const response = await adminApi.premium.refundInvoice(row.id, {
        payment_reference: draft.payment_reference || "",
        reason: "Admin panel refund",
      });

      setActionMessage(response.data?.message || "Invoice refunded.");
      await loadData();
    } catch (refundError) {
      setError(parseApiError(refundError));
    } finally {
      setRefundingInvoiceId(null);
    }
  };

  const exportEvents = async () => {
    try {
      setExportingEvents(true);
      setError("");
      setActionMessage("");

      const response = await adminApi.premium.exportEventsCsv({
        limit: 2000,
        provider: eventProviderFilter,
        status: eventStatusFilter,
        event_type: eventTypeFilter,
        invoice_number: eventInvoiceFilter,
        subscription_id: eventSubscriptionFilter,
        processed_from: eventProcessedFromFilter,
        processed_to: eventProcessedToFilter,
      });

      const contentDisposition = String(response?.headers?.["content-disposition"] || "");
      const match = /filename="?([^";]+)"?/i.exec(contentDisposition);
      const filename = match?.[1] || "membership_payment_events.csv";

      const blob = response.data instanceof Blob
        ? response.data
        : new Blob([response.data], { type: "text/csv;charset=utf-8" });
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);

      setActionMessage("Event CSV downloaded.");
    } catch (exportError) {
      setError(parseApiError(exportError));
    } finally {
      setExportingEvents(false);
    }
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="heading-h2 mb-1 font-semibold text-gray-900">Premium Billing Operations</h2>
          <p className="text-sm text-gray-600">
            Review premium subscriptions and invoices, then apply manual lifecycle updates.
          </p>
        </div>
        <Button type="button" variant="secondary" onClick={loadData} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
      {actionMessage && <p className="mb-3 text-sm text-[#3B82F6]">{actionMessage}</p>}

      {metrics && (
        <section className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Subscriptions</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{metrics.total_subscriptions || 0}</p>
            <p className="mt-1 text-xs text-slate-600">
              Active {metrics.active_subscriptions || 0} | Pending {metrics.pending_subscriptions || 0}
            </p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Invoices</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{metrics.total_invoices || 0}</p>
            <p className="mt-1 text-xs text-slate-600">
              Paid {metrics.paid_invoices || 0} | Pending {metrics.pending_invoices || 0}
            </p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Paid Revenue</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">
              {formatCurrency(metrics.paid_revenue_cents || 0, "INR")}
            </p>
            <p className="mt-1 text-xs text-slate-600">Refunded invoices: {metrics.refunded_invoices || 0}</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Recurring Revenue</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              MRR: {formatCurrency(metrics.monthly_recurring_revenue_cents || 0, "INR")}
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              YRR: {formatCurrency(metrics.yearly_recurring_revenue_cents || 0, "INR")}
            </p>
          </article>
        </section>
      )}

      <section className="mb-6 rounded-2xl border border-slate-200">
        <div className="flex flex-wrap items-end gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-gray-900">Subscriptions</p>
            <p className="text-xs text-gray-500">Status and lifecycle control for premium subscriptions.</p>
          </div>
          <label className="ml-auto">
            <span className="mb-1 block text-xs font-medium text-gray-600">Filter Status</span>
            <select
              value={subscriptionFilter}
              onChange={(event) => setSubscriptionFilter(event.target.value)}
              className="input-base py-1.5"
            >
              <option value="">All</option>
              {subscriptionStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 bg-white text-left text-gray-700">
              <tr>
                <th className="px-3 py-2">Member</th>
                <th className="px-3 py-2">Membership ID</th>
                <th className="px-3 py-2">Plan</th>
                <th className="px-3 py-2">Billing</th>
                <th className="px-3 py-2">Period</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Cancel @ End</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((row) => {
                const draft = subscriptionDrafts[row.id] || {
                  status: row.status,
                  cancel_at_period_end: row.cancel_at_period_end,
                };
                const saving = savingSubscriptionId === row.id;
                const renewing = renewingSubscriptionId === row.id;

                return (
                  <tr key={row.id} className="border-t border-slate-200">
                    <td className="px-3 py-2">
                      <p className="font-medium text-gray-900">{row.member_name || "-"}</p>
                      <p className="text-xs text-gray-500">{row.member_email || "-"}</p>
                    </td>
                    <td className="px-3 py-2">{row.member_membership_id || "-"}</td>
                    <td className="px-3 py-2">
                      <p className="font-medium text-gray-900">{row.plan_name || row.plan_code || "-"}</p>
                      <p className="text-xs text-gray-500">{row.plan_code || "-"}</p>
                    </td>
                    <td className="px-3 py-2">{row.billing_cycle || "-"}</td>
                    <td className="px-3 py-2 text-xs text-gray-600">
                      <p>{formatDateTime(row.current_period_start)}</p>
                      <p>{formatDateTime(row.current_period_end)}</p>
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={draft.status}
                        onChange={(event) =>
                          setSubscriptionDrafts((prev) => ({
                            ...prev,
                            [row.id]: {
                              ...draft,
                              status: event.target.value,
                            },
                          }))
                        }
                        className="input-base py-1.5"
                        disabled={saving}
                      >
                        {subscriptionStatuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={Boolean(draft.cancel_at_period_end)}
                        onChange={(event) =>
                          setSubscriptionDrafts((prev) => ({
                            ...prev,
                            [row.id]: {
                              ...draft,
                              cancel_at_period_end: event.target.checked,
                            },
                          }))
                        }
                        disabled={saving}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-col gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => saveSubscription(row.id)}
                          disabled={saving || renewing}
                        >
                          {saving ? "Saving..." : "Save"}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => renewSubscription(row, false)}
                          disabled={saving || renewing}
                        >
                          {renewing ? "Processing..." : "Renew"}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => renewSubscription(row, true)}
                          disabled={saving || renewing}
                        >
                          {renewing ? "Processing..." : "Renew + Activate"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {!loading && subscriptions.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-5 text-sm text-gray-500">
                    No subscriptions found for the current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200">
        <div className="flex flex-wrap items-end gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-gray-900">Invoices</p>
            <p className="text-xs text-gray-500">Update invoice states and payment references when required.</p>
          </div>
          <label className="ml-auto">
            <span className="mb-1 block text-xs font-medium text-gray-600">Filter Status</span>
            <select
              value={invoiceFilter}
              onChange={(event) => setInvoiceFilter(event.target.value)}
              className="input-base py-1.5"
            >
              <option value="">All</option>
              {invoiceStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 bg-white text-left text-gray-700">
              <tr>
                <th className="px-3 py-2">Invoice</th>
                <th className="px-3 py-2">Member</th>
                <th className="px-3 py-2">Plan</th>
                <th className="px-3 py-2">Amount</th>
                <th className="px-3 py-2">Due</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Payment Ref</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((row) => {
                const draft = invoiceDrafts[row.id] || {
                  status: row.status,
                  payment_reference: row.payment_reference || "",
                };
                const saving = savingInvoiceId === row.id;
                const refunding = refundingInvoiceId === row.id;

                return (
                  <tr key={row.id} className="border-t border-slate-200">
                    <td className="px-3 py-2">
                      <p className="font-medium text-gray-900">{row.invoice_number}</p>
                      <p className="text-xs text-gray-500">Created: {formatDateTime(row.created_at)}</p>
                    </td>
                    <td className="px-3 py-2">
                      <p className="font-medium text-gray-900">{row.member_name || "-"}</p>
                      <p className="text-xs text-gray-500">{row.member_membership_id || "-"}</p>
                    </td>
                    <td className="px-3 py-2">{row.plan_name || row.plan_code || "-"}</td>
                    <td className="px-3 py-2">{formatCurrency(row.amount_cents, row.currency)}</td>
                    <td className="px-3 py-2 text-xs text-gray-600">
                      <p>{formatDateTime(row.due_at)}</p>
                      <p>Paid: {formatDateTime(row.paid_at)}</p>
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={draft.status}
                        onChange={(event) =>
                          setInvoiceDrafts((prev) => ({
                            ...prev,
                            [row.id]: {
                              ...draft,
                              status: event.target.value,
                            },
                          }))
                        }
                        className="input-base py-1.5"
                        disabled={saving}
                      >
                        {invoiceStatuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        value={draft.payment_reference}
                        onChange={(event) =>
                          setInvoiceDrafts((prev) => ({
                            ...prev,
                            [row.id]: {
                              ...draft,
                              payment_reference: event.target.value,
                            },
                          }))
                        }
                        placeholder="payment id"
                        className="input-base min-w-[170px] py-1.5"
                        disabled={saving}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-col gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => saveInvoice(row.id)}
                          disabled={saving || refunding}
                        >
                          {saving ? "Saving..." : "Save"}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => refundInvoice(row)}
                          disabled={saving || refunding || row.status !== "paid"}
                        >
                          {refunding ? "Refunding..." : "Refund"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {!loading && invoices.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-5 text-sm text-gray-500">
                    No invoices found for the current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-gray-900">Payment Event Trail</p>
              <p className="text-xs text-gray-500">Recent payment and admin billing events.</p>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={exportEvents}
              disabled={loading || exportingEvents}
            >
              {exportingEvents ? "Exporting..." : "Export CSV"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                setEventProviderFilter("");
                setEventStatusFilter("");
                setEventTypeFilter("");
                setEventInvoiceFilter("");
                setEventSubscriptionFilter("");
                setEventProcessedFromFilter("");
                setEventProcessedToFilter("");
              }}
              disabled={loading}
            >
              Clear Event Filters
            </Button>
          </div>

          <div className="mt-3 grid gap-2 md:grid-cols-7">
            <label>
              <span className="mb-1 block text-xs font-medium text-gray-600">Provider</span>
              <select
                value={eventProviderFilter}
                onChange={(event) => setEventProviderFilter(event.target.value)}
                className="input-base py-1.5"
              >
                <option value="">All</option>
                <option value="admin">admin</option>
                <option value="stripe">stripe</option>
                <option value="razorpay">razorpay</option>
                <option value="sandbox">sandbox</option>
              </select>
            </label>

            <label>
              <span className="mb-1 block text-xs font-medium text-gray-600">Status</span>
              <input
                value={eventStatusFilter}
                onChange={(event) => setEventStatusFilter(event.target.value)}
                className="input-base py-1.5"
                placeholder="paid, refunded..."
              />
            </label>

            <label>
              <span className="mb-1 block text-xs font-medium text-gray-600">Event Type</span>
              <input
                value={eventTypeFilter}
                onChange={(event) => setEventTypeFilter(event.target.value)}
                className="input-base py-1.5"
                placeholder="admin.invoice.refund"
              />
            </label>

            <label>
              <span className="mb-1 block text-xs font-medium text-gray-600">Invoice Number</span>
              <input
                value={eventInvoiceFilter}
                onChange={(event) => setEventInvoiceFilter(event.target.value)}
                className="input-base py-1.5"
                placeholder="INV-..."
              />
            </label>

            <label>
              <span className="mb-1 block text-xs font-medium text-gray-600">Subscription ID</span>
              <input
                value={eventSubscriptionFilter}
                onChange={(event) => setEventSubscriptionFilter(event.target.value)}
                className="input-base py-1.5"
                inputMode="numeric"
                placeholder="123"
              />
            </label>

            <label>
              <span className="mb-1 block text-xs font-medium text-gray-600">Processed From</span>
              <input
                type="datetime-local"
                value={eventProcessedFromFilter}
                onChange={(event) => setEventProcessedFromFilter(event.target.value)}
                className="input-base py-1.5"
              />
            </label>

            <label>
              <span className="mb-1 block text-xs font-medium text-gray-600">Processed To</span>
              <input
                type="datetime-local"
                value={eventProcessedToFilter}
                onChange={(event) => setEventProcessedToFilter(event.target.value)}
                className="input-base py-1.5"
              />
            </label>
          </div>
        </div>

        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 bg-white text-left text-gray-700">
              <tr>
                <th className="px-3 py-2">When</th>
                <th className="px-3 py-2">Provider</th>
                <th className="px-3 py-2">Event</th>
                <th className="px-3 py-2">Invoice</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Reference</th>
              </tr>
            </thead>
            <tbody>
              {events.map((row) => (
                <tr key={row.id} className="border-t border-slate-200">
                  <td className="px-3 py-2 text-xs text-slate-600">{formatDateTime(row.processed_at)}</td>
                  <td className="px-3 py-2">{row.provider || "-"}</td>
                  <td className="px-3 py-2 text-xs text-slate-700">{row.event_type || "-"}</td>
                  <td className="px-3 py-2">{row.invoice_number || "-"}</td>
                  <td className="px-3 py-2">{row.status || "-"}</td>
                  <td className="px-3 py-2 text-xs text-slate-600">{row.payment_reference || "-"}</td>
                </tr>
              ))}

              {!loading && events.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-5 text-sm text-gray-500">
                    No payment events recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
