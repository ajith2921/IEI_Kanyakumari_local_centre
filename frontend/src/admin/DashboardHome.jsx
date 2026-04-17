import { useEffect, useState } from "react";
import { adminApi, parseApiError } from "../services/api";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import ErrorState from "../components/ErrorState";

const cards = [
  { label: "Members", key: "members" },
  { label: "Gallery Items", key: "gallery" },
  { label: "Newsletters", key: "newsletters" },
  { label: "Activities", key: "activities" },
  { label: "Facilities", key: "facilities" },
  { label: "Downloads", key: "downloads" },
  { label: "Contact Messages", key: "contacts" },
  { label: "Membership Requests", key: "membership" },
];

export default function DashboardHome() {
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [auditLoading, setAuditLoading] = useState(true);
  const [auditError, setAuditError] = useState("");
  const [auditReport, setAuditReport] = useState({ scanned: 0, flagged_count: 0, items: [] });
  const [autoFixingKey, setAutoFixingKey] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [
          members,
          gallery,
          newsletters,
          activities,
          facilities,
          downloads,
          contacts,
          membership,
        ] = await Promise.all([
          adminApi.members.list(),
          adminApi.gallery.list(),
          adminApi.newsletters.list(),
          adminApi.activities.list(),
          adminApi.facilities.list(),
          adminApi.downloads.list(),
          adminApi.contacts.list(),
          adminApi.membership.list(),
        ]);

        setCounts({
          members: members.data.length,
          gallery: gallery.data.length,
          newsletters: newsletters.data.length,
          activities: activities.data.length,
          facilities: facilities.data.length,
          downloads: downloads.data.length,
          contacts: contacts.data.length,
          membership: membership.data.length,
        });
      } catch (err) {
        setError(parseApiError(err));
      } finally {
        setLoading(false);
      }
    };

    const loadAudit = async () => {
      setAuditLoading(true);
      setAuditError("");
      try {
        const response = await adminApi.imageAudit.list();
        setAuditReport(response.data || { scanned: 0, flagged_count: 0, items: [] });
      } catch (err) {
        setAuditError(parseApiError(err));
      } finally {
        setAuditLoading(false);
      }
    };

    load();
    loadAudit();
  }, []);

  const onAutoFix = async (entity, id) => {
    const key = `${entity}:${id}`;
    setAutoFixingKey(key);
    try {
      await adminApi.imageAudit.autoFix(entity, id);
      const [countsResponse, auditResponse] = await Promise.all([
        Promise.all([
          adminApi.members.list(),
          adminApi.gallery.list(),
          adminApi.newsletters.list(),
          adminApi.activities.list(),
          adminApi.facilities.list(),
          adminApi.downloads.list(),
          adminApi.contacts.list(),
          adminApi.membership.list(),
        ]),
        adminApi.imageAudit.list(),
      ]);

      const [members, gallery, newsletters, activities, facilities, downloads, contacts, membership] =
        countsResponse;

      setCounts({
        members: members.data.length,
        gallery: gallery.data.length,
        newsletters: newsletters.data.length,
        activities: activities.data.length,
        facilities: facilities.data.length,
        downloads: downloads.data.length,
        contacts: contacts.data.length,
        membership: membership.data.length,
      });
      setAuditReport(auditResponse.data || { scanned: 0, flagged_count: 0, items: [] });
    } catch (err) {
      setAuditError(parseApiError(err));
    } finally {
      setAutoFixingKey("");
    }
  };

  return (
    <div>
      <h2 className="heading-h2 mb-2 font-semibold text-gray-900">Overview</h2>
      <p className="mb-6 text-gray-600">Manage website content and incoming requests.</p>

      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <article key={index} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="skeleton h-3 w-2/3" />
              <div className="skeleton mt-3 h-8 w-1/2" />
            </article>
          ))}
        </div>
      )}
      {error && <ErrorState message={error} />}

      {!loading && !error && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <Card
              key={card.key}
              className="p-4"
            >
              <p className="text-sm font-medium text-brand-700">{card.label}</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">{counts[card.key] ?? 0}</p>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Image Quality Audit</h3>
            <p className="text-sm text-brand-700">
              Automatically scans member, gallery, activity, and facility images for ratio and crop risks.
            </p>
          </div>
          {!auditLoading && !auditError && (
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand-700">
              Flagged: {auditReport.flagged_count} / Scanned: {auditReport.scanned}
            </span>
          )}
        </div>

        {auditLoading && (
          <div className="grid gap-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="rounded-lg border border-brand-100 bg-white p-3">
                <div className="skeleton h-4 w-1/3" />
                <div className="skeleton mt-2 h-3 w-full" />
              </div>
            ))}
          </div>
        )}

        {!auditLoading && auditError && (
          <ErrorState message={auditError} />
        )}

        {!auditLoading && !auditError && auditReport.items.length === 0 && (
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            No risky images detected. Current dataset looks clean.
          </p>
        )}

        {!auditLoading && !auditError && auditReport.items.length > 0 && (
          <div className="overflow-auto rounded-2xl border border-slate-200 bg-white">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-100/95 text-left text-gray-700">
                <tr>
                  <th className="px-3 py-2">Entity</th>
                  <th className="px-3 py-2">Item</th>
                  <th className="px-3 py-2">Issues</th>
                  <th className="px-3 py-2">Suggestion</th>
                  <th className="px-3 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {auditReport.items.slice(0, 20).map((item) => {
                  const key = `${item.entity}:${item.id}`;
                  return (
                    <tr key={key} className="border-t border-slate-200 align-top">
                      <td className="px-3 py-2 font-semibold capitalize text-brand-800">{item.entity}</td>
                      <td className="px-3 py-2 text-gray-700">{item.label}</td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-1">
                          {item.issues.map((issue) => (
                            <span
                              key={issue}
                              className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800"
                            >
                              {issue}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="max-w-sm px-3 py-2 text-gray-600">{item.suggestion}</td>
                      <td className="px-3 py-2">
                        {item.auto_fix_available ? (
                          <Button
                            type="button"
                            onClick={() => onAutoFix(item.entity, item.id)}
                            disabled={autoFixingKey === key}
                            variant="secondary"
                            size="sm"
                          >
                            {autoFixingKey === key ? "Fixing..." : "Auto-Fix"}
                          </Button>
                        ) : (
                          <span className="text-xs text-gray-500">Re-upload needed</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
