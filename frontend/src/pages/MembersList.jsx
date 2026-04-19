import { useMemo, useState } from "react";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import useFetchList from "../hooks/useFetchList";
import { publicApi, toAbsoluteUploadUrl } from "../services/api";

const OFFICE_BEARERS_LABEL = "Office Bearers";
const DIVISION_COLLATOR = new Intl.Collator(undefined, {
  sensitivity: "base",
  numeric: true,
});

function getDivisionLabel(position) {
  const normalizedPosition = String(position || "").trim();

  if (!normalizedPosition) {
    return OFFICE_BEARERS_LABEL;
  }

  if (!/committee member$/i.test(normalizedPosition)) {
    return OFFICE_BEARERS_LABEL;
  }

  const divisionName = normalizedPosition.replace(/\s*Committee Member\s*$/i, "").trim();
  return divisionName || "Engineering Divisions";
}

/* ── AVATAR FALLBACK ──────────────────────────────────── */
function AvatarFallback({ name }) {
  return (
    <div
      aria-hidden="true"
      className="flex h-full w-full select-none items-center justify-center bg-gradient-to-br from-slate-200 via-slate-100 to-white text-slate-500"
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-12 w-12" role="img" aria-label={`${name || "Member"} profile placeholder`}>
        <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.7" />
        <path
          d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

/* ── PROFILE IMAGE ────────────────────────────────────── */
function ProfileImage({ src, name }) {
  const [error, setError] = useState(false);
  if (!src || error) return <AvatarFallback name={name} />;

  return (
    <img
      src={src}
      alt={name}
      loading="lazy"
      decoding="async"
      onError={() => setError(true)}
      className="block h-full w-full object-cover object-center"
    />
  );
}

/* ── MEMBER ROW ───────────────────────────────────────── */
function MemberRow({ member, rowIndex }) {
  const name         = member.name?.trim()                     || "Member";
  const position     = member.position?.trim()                 || "Member";
  const address      = member.address?.trim()                  || "";
  const email        = member.email?.trim()                    || "";
  const phone        = member.mobile?.trim() || member.phone?.trim() || "";
  const membershipId = member.membership_id?.toString().trim() || "";
  const imgSrc       = toAbsoluteUploadUrl(member.image_url);
  const enterDelay = `${Math.min(rowIndex, 14) * 35}ms`;

  return (
    <article
      className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md animate-fade-up sm:p-5 lg:p-6"
      style={{ animationDelay: enterDelay }}
    >
      <div className="absolute left-0 top-5 h-12 w-1 rounded-r-full bg-gradient-to-b from-cyan-400 to-emerald-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(2,132,199,0.08),transparent_45%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-600">
              {position}
            </p>
            {membershipId && (
              <span className="rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1 text-[11px] font-semibold tracking-wide text-cyan-700">
                M.No. {membershipId}
              </span>
            )}
          </div>

          <h2 className="mt-3 break-words text-lg font-semibold leading-tight text-slate-900 sm:text-xl">
            {name}
          </h2>

          {address && (
            <p className="mt-3 whitespace-pre-line break-words text-sm leading-relaxed text-slate-600">
              {address}
            </p>
          )}

          {(email || phone) && (
            <div className="mt-4 flex flex-wrap gap-2.5">
              {email && (
                <a
                  href={`mailto:${email}`}
                  className="inline-flex max-w-full items-center rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors duration-200 hover:border-cyan-200 hover:text-cyan-700"
                >
                  <span className="mr-2 text-slate-400">Email</span>
                  <span className="truncate">{email}</span>
                </a>
              )}

              {phone && (
                <a
                  href={`tel:${phone}`}
                  className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors duration-200 hover:border-cyan-200 hover:text-cyan-700"
                >
                  <span className="mr-2 text-slate-400">Phone</span>
                  {phone}
                </a>
              )}
            </div>
          )}
        </div>

        <div className="mx-auto flex-shrink-0 sm:mx-0">
          <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-slate-100 shadow-sm ring-1 ring-slate-200 sm:h-28 sm:w-28">
            <ProfileImage src={imgSrc} name={name} />
          </div>
        </div>
      </div>
    </article>
  );
}

/* ── ROW SKELETON ─────────────────────────────────────── */
function RowSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-start sm:justify-between sm:p-6">
      <div className="flex flex-1 flex-col gap-3">
        <div className="h-6 w-44 rounded-full bg-slate-100" />
        <div className="h-5 w-72 rounded bg-slate-200" />
        <div className="h-3 w-full max-w-xl rounded bg-slate-100" />
        <div className="h-3 w-3/4 max-w-md rounded bg-slate-100" />
        <div className="mt-1 flex gap-2">
          <div className="h-7 w-40 rounded-xl bg-slate-100" />
          <div className="h-7 w-32 rounded-xl bg-slate-100" />
        </div>
      </div>
      <div className="h-28 w-28 flex-shrink-0 rounded-full bg-slate-200" />
    </div>
  );
}

/* ── INSTITUTIONAL HEADER ─────────────────────────────── */
function InstitutionalHeader({ totalMembers }) {
  return (
    <header className="directory-glass relative overflow-hidden rounded-[1.75rem] border border-slate-200 p-5 shadow-sm sm:p-7 lg:p-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.14),transparent_45%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.10),transparent_40%)]" />

      <div className="relative">
        <p className="eyebrow-chip mb-3">Committee Directory · Term 2025-2027</p>
        <h1 className="directory-hero-title heading-h1 text-slate-900">
          IEI Kanyakumari Member Register
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
          A unified one-page committee register grouped by engineering division with a polished institutional presentation.
        </p>
        <p className="mt-2 text-xs font-medium uppercase tracking-[0.08em] text-slate-500">
          Live data stream grouped by division and role
        </p>

        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white/90 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Total Members</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{totalMembers}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white/90 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">View Mode</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">Read-Only Directory</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white/90 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Data Source</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">Live Member Registry</p>
          </div>
        </div>
      </div>
    </header>
  );
}

/* ── PAGE — MembersList ───────────────────────────────── */
export default function MembersList() {
  const { data, loading, error, reload } = useFetchList(publicApi.getMembers);
  const members = Array.isArray(data) ? data : [];
  const divisionSections = useMemo(() => {
    const groupedMembers = new Map();

    members.forEach((member) => {
      const divisionLabel = getDivisionLabel(member.position);
      if (!groupedMembers.has(divisionLabel)) {
        groupedMembers.set(divisionLabel, []);
      }
      groupedMembers.get(divisionLabel).push(member);
    });

    const sortedEntries = Array.from(groupedMembers.entries()).sort(([left], [right]) => {
      if (left === OFFICE_BEARERS_LABEL) {
        return -1;
      }
      if (right === OFFICE_BEARERS_LABEL) {
        return 1;
      }
      return DIVISION_COLLATOR.compare(left, right);
    });

    let runningRowIndex = 0;

    return sortedEntries.map(([divisionName, divisionMembers]) => {
      const rows = divisionMembers.map((member, localIndex) => ({
        key: member.id ?? `${divisionName}-${member.name}-${localIndex}`,
        member,
        rowIndex: runningRowIndex++,
      }));

      return {
        divisionName,
        memberCount: divisionMembers.length,
        rows,
      };
    });
  }, [members]);

  const registerSummary = `${members.length} members across ${divisionSections.length} sections`;

  return (
    <div className="directory-shell min-h-screen">
      <main className="page-shell py-10 sm:py-14 lg:py-20">

        <InstitutionalHeader
          totalMembers={members.length}
        />

        {!loading && !error && members.length > 0 && (
          <p className="mt-5 border-b border-slate-200 pb-2 text-xs font-medium uppercase tracking-[0.08em] text-slate-500 sm:mt-6">
            {registerSummary}
          </p>
        )}

        {loading && (
          <div className="mt-8 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <RowSkeleton key={i} />
            ))}
          </div>
        )}

        {error && (
          <div className="mt-8">
            <ErrorState message={error} onRetry={reload} />
          </div>
        )}

        {!loading && !error && (
          members.length === 0 ? (
            <div className="mt-10">
              <EmptyState
                title="No members found"
                description="Member profiles will appear here after they are published by the admin team."
              />
            </div>
          ) : (
            <div className="mt-8 space-y-8">
              {divisionSections.map((section) => (
                <section key={section.divisionName} aria-label={section.divisionName}>
                  <div className="mb-4 flex items-center justify-between gap-3 border-b border-slate-200 pb-2">
                    <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-700 sm:text-base">
                      {section.divisionName}
                    </h2>
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold tracking-wide text-slate-600">
                      {section.memberCount}
                    </span>
                  </div>

                  <div className="grid gap-4">
                    {section.rows.map((row) => (
                      <MemberRow
                        key={row.key}
                        member={row.member}
                        rowIndex={row.rowIndex}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )
        )}
      </main>
    </div>
  );
}
