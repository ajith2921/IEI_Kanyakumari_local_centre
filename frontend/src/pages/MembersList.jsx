import { useState } from "react";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import useFetchList from "../hooks/useFetchList";
import { publicApi, toAbsoluteUploadUrl } from "../services/api";

/* ── AVATAR FALLBACK ──────────────────────────────────── */
function AvatarFallback({ name }) {
  const initial = (name || "M").trim().charAt(0).toUpperCase();
  return (
    <div
      aria-hidden="true"
      className="flex h-full w-full select-none items-center justify-center bg-gray-900 text-2xl font-semibold text-white"
    >
      {initial}
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
function MemberRow({ member, isLast }) {
  const name         = member.name?.trim()                     || "Member";
  const position     = member.position?.trim()                 || "Member";
  const address      = member.address?.trim()                  || "";
  const email        = member.email?.trim()                    || "";
  const phone        = member.mobile?.trim() || member.phone?.trim() || "";
  const membershipId = member.membership_id?.toString().trim() || "";
  const imgSrc       = toAbsoluteUploadUrl(member.image_url);

  return (
    <article
      className={`flex flex-col items-center gap-6 py-6 sm:flex-row sm:justify-between ${
        isLast ? "" : "border-b border-gray-100"
      }`}
    >
      {/* Text */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-gray-500">{position}</p>
        <div className="mt-1 flex flex-wrap items-baseline gap-2">
          <h2 className="break-words text-lg font-semibold text-gray-900">{name}</h2>
          {membershipId && (
            <span className="whitespace-nowrap text-xs font-medium text-gray-400">
              M.No.&thinsp;{membershipId}
            </span>
          )}
        </div>
        {address && (
          <p className="mt-2 whitespace-pre-line break-words text-sm leading-relaxed text-gray-500">
            {address}
          </p>
        )}
        {email && (
          <p className="mt-1 text-sm text-gray-500">
            <span className="text-gray-300">Email:&nbsp;</span>
            <a href={`mailto:${email}`} className="break-all text-blue-500 underline underline-offset-2">
              {email}
            </a>
          </p>
        )}
        {phone && (
          <p className="mt-0.5 text-sm text-gray-500">
            <span className="text-gray-300">Ph:&nbsp;</span>
            {phone}
          </p>
        )}
      </div>

      {/* Image */}
      <div className="flex-shrink-0">
        <div className="h-28 w-28 overflow-hidden rounded-full border border-gray-100 bg-gray-50">
          <ProfileImage src={imgSrc} name={name} />
        </div>
      </div>
    </article>
  );
}

/* ── ROW SKELETON ─────────────────────────────────────── */
function RowSkeleton() {
  return (
    <div className="flex animate-pulse items-start justify-between gap-5 border-b border-gray-100 py-5">
      <div className="flex flex-1 flex-col gap-2">
        <div className="h-2.5 w-28 rounded bg-gray-100" />
        <div className="h-3.5 w-48 rounded bg-gray-200" />
        <div className="h-2.5 w-64 rounded bg-gray-100" />
        <div className="h-2.5 w-44 rounded bg-gray-100" />
      </div>
      <div className="h-24 w-24 flex-shrink-0 rounded-full bg-gray-200" />
    </div>
  );
}

/* ── OFFICE BEARERS ───────────────────────────────────── */
const OFFICE_BEARERS = [
  { role: "Chairman",                  name: "Dr. M. Marsaline Beno"       },
  { role: "Honorary Secretary",        name: "Dr. J. Prakash Arul Jose"    },
  { role: "Honorary Joint Secretary",  name: "Dr. A. Megalingam"           },
  { role: "Immediate Past Chairman",   name: "Er. S. Bright Selvin"        },
];

function OfficeBearersSection() {
  return (
    <section className="mt-16">
      <div className="mb-6 border-b border-gray-100 pb-4">
        <p className="eyebrow-chip mb-0.5">Office Bearers (2025–2027)</p>
        <p className="text-xs italic text-gray-400">Executive Leadership</p>
      </div>

      {OFFICE_BEARERS.map((bearer, idx) => (
        <div
          key={bearer.role}
          className={`flex items-baseline gap-4 py-3 ${
            idx < OFFICE_BEARERS.length - 1 ? "border-b border-gray-100" : ""
          }`}
        >
          <span className="min-w-[200px] flex-shrink-0 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            {bearer.role}
          </span>
          <span className="text-sm font-semibold text-gray-900">{bearer.name}</span>
        </div>
      ))}
    </section>
  );
}

/* ── DIVISION-WISE COMMITTEE ──────────────────────────── */
const DIVISIONS = [
  { division: "Civil Engineering Division", members: ["Dr. J. Prakash Arul Jose", "Er. S. Natarajan", "Er. A. Rajakumar", "Er. K. Sivakumar", "Er. P. Gopal"] },
  { division: "Electrical Engineering Division", members: ["Dr. M. Marsaline Beno", "Er. V. Muthum Perumal", "Dr. T. Sree Renga Raja", "Er. V. Sivathanu Pillai"] },
  { division: "Mechanical Engineering Division", members: ["Dr. A. Megalingam", "Er. M.A. Perumal", "Dr. Jenix Rino J"] },
  { division: "Computer / IT Division", members: ["Dr. S. Arumuga Perumal"] },
  { division: "Electronics & Communication Division", members: ["Dr. A. Albert Raj"] },
  { division: "Chemical Engineering Division", members: ["Dr. Rimal Isaac R.S."] },
  { division: "Environmental Engineering Division", members: ["Er. Ganesh Kumar", "Dr. V. Karthikeyan"] },
  { division: "Applied Science / Management", members: ["Dr. N. Azhagesan"] },
];

function DivisionMembersSection() {
  return (
    <section className="mt-16">
      <div className="mb-6 border-b border-gray-100 pb-4">
        <p className="eyebrow-chip">Committee Members by Division</p>
      </div>

      <div className="grid grid-cols-1 gap-0 md:grid-cols-2">
        {DIVISIONS.map((div, dIdx) => (
          <div
            key={div.division}
            className={`border-b border-gray-100 py-5 ${
              dIdx % 2 === 0 ? "md:border-r md:border-gray-100 md:pr-8" : "md:pl-8"
            }`}
          >
            <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              {div.division}
            </p>
            <ul className="space-y-0.5">
              {div.members.map((member) => (
                <li key={member} className="flex items-center gap-2 py-1 text-sm text-gray-600">
                  <span className="text-gray-300">›</span>
                  {member}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── INSTITUTIONAL HEADER ─────────────────────────────── */
function InstitutionalHeader() {
  return (
    <header className="mb-12 border-b border-gray-100 pb-8">
      <p className="eyebrow-chip mb-3">Committee · Term 2025–2027</p>
      <h1 className="heading-h1 text-gray-900">
        The Institution of Engineers (India)
      </h1>
      <p className="mt-2 text-lg text-gray-400">Kanyakumari Local Centre</p>
    </header>
  );
}

/* ── PAGE — MembersList ───────────────────────────────── */
export default function MembersList() {
  const { data, loading, error, reload } = useFetchList(publicApi.getMembers);

  return (
    <div className="min-h-screen bg-white">
      <main className="page-shell py-20">

        {/* ① Institutional header */}
        <InstitutionalHeader />

        {/* ② Loading state */}
        {loading && (
          <div className="mt-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <RowSkeleton key={i} />
            ))}
          </div>
        )}

        {/* ③ Error state */}
        {error && (
          <div className="mt-8">
            <ErrorState message={error} onRetry={reload} />
          </div>
        )}

        {/* ④ Members list */}
        {!loading && !error && (
          data.length > 0 ? (
            <section aria-label="Committee members" className="mt-2">
              {data.map((member, idx) => (
                <MemberRow
                  key={member.id ?? idx}
                  member={member}
                  isLast={idx === data.length - 1}
                />
              ))}
            </section>
          ) : (
            <div className="mt-10">
              <EmptyState
                title="No members found"
                description="Member profiles will appear here after they are published by the admin team."
              />
            </div>
          )
        )}

        {/* ⑤ Office Bearers */}
        <OfficeBearersSection />

        {/* ⑥ Committee Members by Division */}
        <DivisionMembersSection />

        {/* ⑦ Footer attestation */}
        <footer className="mt-12 border-t border-gray-100 pt-4 text-center text-[11px] text-gray-300">
          Official Committee Members List &middot; The Institution of Engineers (India)
          &middot; Kanyakumari Local Centre
        </footer>
      </main>
    </div>
  );
}
