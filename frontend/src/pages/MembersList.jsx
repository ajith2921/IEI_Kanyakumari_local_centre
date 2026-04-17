import { useState } from "react";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import useFetchList from "../hooks/useFetchList";
import { publicApi, toAbsoluteUploadUrl } from "../services/api";

/* ═══════════════════════════════════════════════════════
   AVATAR FALLBACK — initials, IEI navy flat style
═══════════════════════════════════════════════════════ */
function AvatarFallback({ name }) {
  const initial = (name || "M").trim().charAt(0).toUpperCase();
  return (
    <div
      aria-hidden="true"
      className="flex h-full w-full items-center justify-center select-none"
      style={{
        backgroundColor: "#1f3c88",
        color: "#ffffff",
        fontFamily: '"Arial", "Helvetica Neue", Helvetica, sans-serif',
        fontSize: "1.6rem",
        fontWeight: "bold",
      }}
    >
      {initial}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   PROFILE IMAGE — circular, face-correct framing
═══════════════════════════════════════════════════════ */
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
      className="h-full w-full object-cover object-center"
      style={{ display: "block" }}
    />
  );
}

/* shared text styles ─────────────────────────────────── */
const FONT_SERIF  = '"Times New Roman", Georgia, serif';
const FONT_SANS   = '"Arial", "Helvetica Neue", Helvetica, sans-serif';
const CLR_NAVY    = "#1f3c88";
const CLR_MAROON  = "#8B0000";
const CLR_BODY    = "#333333";
const CLR_MUTED   = "#666666";
const CLR_SILVER  = "#c0c0c0";

/* ═══════════════════════════════════════════════════════
   MEMBER ROW — IEI document style
═══════════════════════════════════════════════════════ */
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
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",         /* vertically center image to text     */
        justifyContent: "space-between",
        gap: "24px",
        paddingTop: "20px",
        paddingBottom: "20px",
        borderBottom: isLast ? "none" : `1px solid ${CLR_SILVER}`,
      }}
      className="flex-col sm:flex-row"
    >
      {/* ── LEFT TEXT (70%) ──────────────────────────────── */}
      <div style={{ flex: 1, minWidth: 0 }}>

        {/* Position / Designation */}
        <p style={{
          fontFamily: FONT_SANS,
          fontSize: "18px",
          fontWeight: "bold",
          color: CLR_MAROON,
          letterSpacing: "0.02em",
          lineHeight: 1.2,
          marginBottom: "6px",       /* 6px gap between role and name      */
        }}>
          {position}
        </p>

        {/* Name row + optional Membership No — most prominent element */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "8px", marginBottom: "8px" }}>
          <h2
            className="break-words"
            style={{
              fontFamily: FONT_SANS,
              fontSize: "21px",
              fontWeight: "bold",
              color: CLR_NAVY,
              lineHeight: 1.25,
              margin: 0,
            }}
          >
            {name}
          </h2>
          {membershipId && (
            <span style={{
              fontFamily: FONT_SANS,
              fontSize: "16px",
              fontWeight: "600",
              color: CLR_NAVY,        /* same blue as name                  */
              whiteSpace: "nowrap",
            }}>
              M.No.&thinsp;{membershipId}
            </span>
          )}
        </div>

        {/* Address */}
        {address && (
          <p
            className="break-words"
            style={{
              fontFamily: FONT_SERIF,
              fontSize: "15px",
              color: "#444444",
              lineHeight: 1.6,
              whiteSpace: "pre-line",
              marginTop: 0,           /* already offset by name's marginBottom */
            }}
          >
            {address}
          </p>
        )}

        {/* Email */}
        {email && (
          <p style={{
            fontFamily: FONT_SERIF,
            fontSize: "15px",
            color: CLR_BODY,
            marginTop: "5px",
            lineHeight: 1.4,
          }}>
            <span style={{ color: CLR_MUTED }}>Email:&nbsp;</span>
            <a
              href={`mailto:${email}`}
              className="break-all"
              style={{
                color: "#0077cc",
                textDecoration: "underline",
              }}
            >
              {email}
            </a>
          </p>
        )}

        {/* Phone */}
        {phone && (
          <p style={{
            fontFamily: FONT_SERIF,
            fontSize: "15px",
            color: "#333333",
            marginTop: "4px",
            lineHeight: 1.4,
          }}>
            <span style={{ color: CLR_MUTED }}>Ph:&nbsp;</span>
            {phone}
          </p>
        )}
      </div>

      {/* ── RIGHT IMAGE (~30%) — vertically centered via parent alignItems:center */}
      <div style={{ flexShrink: 0 }}>
        <div
          style={{
            width: "130px",
            height: "130px",
            borderRadius: "50%",
            overflow: "hidden",
            border: `1px solid ${CLR_SILVER}`,
            backgroundColor: "#e8e8e8",
          }}
        >
          <ProfileImage src={imgSrc} name={name} />
        </div>
      </div>
    </article>
  );
}

/* ═══════════════════════════════════════════════════════
   ROW SKELETON — IEI-matched loading placeholder
═══════════════════════════════════════════════════════ */
function RowSkeleton() {
  return (
    <div
      className="animate-pulse"
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: "20px",
        paddingTop: "18px",
        paddingBottom: "18px",
        borderBottom: "1px solid #c0c0c0",
      }}
    >
      {/* left text placeholders */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "7px" }}>
        <div style={{ height: "10px", width: "120px",  backgroundColor: "#d8d8d8" }} />
        <div style={{ height: "14px", width: "200px", backgroundColor: "#c8c8c8" }} />
        <div style={{ height: "11px", width: "280px", backgroundColor: "#d8d8d8" }} />
        <div style={{ height: "11px", width: "180px", backgroundColor: "#d8d8d8" }} />
      </div>
      {/* right circle placeholder */}
      <div style={{
        width: "110px",
        height: "110px",
        flexShrink: 0,
        borderRadius: "50%",
        backgroundColor: "#d0d0d0",
      }} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   OFFICE BEARERS — static IEI document section
═══════════════════════════════════════════════════════ */
const OFFICE_BEARERS = [
  { role: "Chairman",                  name: "Dr. M. Marsaline Beno"       },
  { role: "Honorary Secretary",        name: "Dr. J. Prakash Arul Jose"    },
  { role: "Honorary Joint Secretary",  name: "Dr. A. Megalingam"           },
  { role: "Immediate Past Chairman",   name: "Er. S. Bright Selvin"        },
];

function OfficeBearersSection() {
  return (
    <section style={{ marginTop: "40px" }}>
      {/* Section heading rule */}
      <div style={{ marginBottom: "14px" }}>
        <div style={{ height: "3px", backgroundColor: CLR_MAROON }} />
        <div style={{ height: "1px", backgroundColor: CLR_MAROON, marginTop: "2px" }} />
        <p style={{
          fontFamily: FONT_SANS,
          fontSize: "15px",
          fontWeight: "bold",
          color: CLR_MAROON,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          marginTop: "10px",
          marginBottom: "2px",
        }}>
          Office Bearers (2025 – 2027)
        </p>
        <p style={{
          fontFamily: FONT_SERIF,
          fontSize: "13px",
          color: CLR_MUTED,
          fontStyle: "italic",
        }}>
          Executive Leadership
        </p>
      </div>

      {/* Bearers list */}
      {OFFICE_BEARERS.map((bearer, idx) => (
        <div
          key={bearer.role}
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: "14px",
            paddingTop: "10px",
            paddingBottom: "10px",
            borderBottom:
              idx < OFFICE_BEARERS.length - 1
                ? `1px solid ${CLR_SILVER}`
                : "none",
          }}
        >
          {/* Role */}
          <span style={{
            fontFamily: FONT_SANS,
            fontSize: "13px",
            fontWeight: "bold",
            color: CLR_MAROON,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            minWidth: "220px",
            flexShrink: 0,
          }}>
            {bearer.role}
          </span>
          {/* Name */}
          <span style={{
            fontFamily: FONT_SANS,
            fontSize: "16px",
            fontWeight: "bold",
            color: CLR_NAVY,
          }}>
            {bearer.name}
          </span>
        </div>
      ))}

      <div style={{ height: "3px", backgroundColor: CLR_MAROON, marginTop: "2px" }} />
      <div style={{ height: "1px", backgroundColor: CLR_MAROON, marginTop: "2px" }} />
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   DIVISION-WISE COMMITTEE MEMBERS — static section
═══════════════════════════════════════════════════════ */
const DIVISIONS = [
  {
    division: "Civil Engineering Division",
    members: [
      "Dr. J. Prakash Arul Jose",
      "Er. S. Natarajan",
      "Er. A. Rajakumar",
      "Er. K. Sivakumar",
      "Er. P. Gopal",
    ],
  },
  {
    division: "Electrical Engineering Division",
    members: [
      "Dr. M. Marsaline Beno",
      "Er. V. Muthum Perumal",
      "Dr. T. Sree Renga Raja",
      "Er. V. Sivathanu Pillai",
    ],
  },
  {
    division: "Mechanical Engineering Division",
    members: [
      "Dr. A. Megalingam",
      "Er. M.A. Perumal",
      "Dr. Jenix Rino J",
    ],
  },
  {
    division: "Computer / IT Division",
    members: ["Dr. S. Arumuga Perumal"],
  },
  {
    division: "Electronics & Communication Division",
    members: ["Dr. A. Albert Raj"],
  },
  {
    division: "Chemical Engineering Division",
    members: ["Dr. Rimal Isaac R.S."],
  },
  {
    division: "Environmental Engineering Division",
    members: ["Er. Ganesh Kumar", "Dr. V. Karthikeyan"],
  },
  {
    division: "Applied Science / Management",
    members: ["Dr. N. Azhagesan"],
  },
];

function DivisionMembersSection() {
  return (
    <section style={{ marginTop: "36px" }}>
      {/* Section heading */}
      <div style={{ marginBottom: "16px" }}>
        <div style={{ height: "3px", backgroundColor: CLR_MAROON }} />
        <div style={{ height: "1px", backgroundColor: CLR_MAROON, marginTop: "2px" }} />
        <p style={{
          fontFamily: FONT_SANS,
          fontSize: "15px",
          fontWeight: "bold",
          color: CLR_MAROON,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          marginTop: "10px",
        }}>
          Committee Members
        </p>
      </div>

      {/* Division grid — 2 columns on desktop */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: "0",
      }}>
        {DIVISIONS.map((div, dIdx) => (
          <div
            key={div.division}
            style={{
              padding: "14px 0",
              borderBottom: `1px solid ${CLR_SILVER}`,
              borderRight: dIdx % 2 === 0 ? `1px solid ${CLR_SILVER}` : "none",
              paddingRight: dIdx % 2 === 0 ? "24px" : "0",
              paddingLeft: dIdx % 2 === 1 ? "24px" : "0",
            }}
          >
            {/* Division title */}
            <p style={{
              fontFamily: FONT_SANS,
              fontSize: "13px",
              fontWeight: "bold",
              color: CLR_NAVY,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              marginBottom: "8px",
            }}>
              {div.division}
            </p>

            {/* Members list */}
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {div.members.map((member) => (
                <li
                  key={member}
                  style={{
                    fontFamily: FONT_SERIF,
                    fontSize: "14px",
                    color: "#333333",
                    lineHeight: 1.7,
                    paddingLeft: "12px",
                    position: "relative",
                  }}
                >
                  {/* bullet */}
                  <span style={{
                    position: "absolute",
                    left: 0,
                    color: CLR_MAROON,
                    fontWeight: "bold",
                  }}>›</span>
                  {member}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div style={{ height: "3px", backgroundColor: CLR_MAROON, marginTop: "2px" }} />
      <div style={{ height: "1px", backgroundColor: CLR_MAROON, marginTop: "2px" }} />
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   INSTITUTIONAL HEADER
═══════════════════════════════════════════════════════ */
function InstitutionalHeader() {
  return (
    <header className="w-full text-center py-6 px-4 mb-4"
            style={{ backgroundColor: "#f3f3f3" }}>

      {/* ── TOP RULE: thick + thin flat lines ──────────── */}
      <div className="mb-4">
        <div style={{ height: "3px", backgroundColor: "#8B0000" }} />
        <div style={{ height: "1px", backgroundColor: "#8B0000", marginTop: "2px" }} />
      </div>

      {/* ── LINE 1: Institution Name ────────────────────── */}
      <p
        className="leading-snug"
        style={{
          fontFamily: '"Times New Roman", Georgia, serif',
          fontSize: "clamp(1.15rem, 3vw, 1.75rem)",
          fontWeight: "bold",
          color: "#1a1a1a",
          letterSpacing: "0.02em",
        }}
      >
        The Institution of Engineers (India)
      </p>

      {/* ── LINE 2: Established subtitle ───────────────── */}
      <p
        className="mt-1"
        style={{
          fontFamily: '"Times New Roman", Georgia, serif',
          fontSize: "clamp(0.78rem, 1.8vw, 0.95rem)",
          fontStyle: "italic",
          color: "#555555",
          letterSpacing: "0.01em",
        }}
      >
        (Established 1920, Incorporated by Royal Charter 1935)
      </p>

      {/* ── THIN MID RULE ───────────────────────────────── */}
      <div
        className="mx-auto my-3"
        style={{
          height: "1px",
          backgroundColor: "#c0c0c0",
          maxWidth: "560px",
        }}
      />

      {/* ── LINE 3: Local Centre heading (h1) ──────────── */}
      <h1
        className="leading-tight"
        style={{
          fontFamily: '"Arial", "Helvetica Neue", Helvetica, sans-serif',
          fontSize: "clamp(1.4rem, 4vw, 2.2rem)",
          fontWeight: "bold",
          color: "#1f3c88",
          letterSpacing: "0.01em",
          marginTop: "4px",
          marginBottom: "4px",
        }}
      >
        Kanyakumari Local Centre
      </h1>

      {/* ── LINE 4: Section title ───────────────────────── */}
      <p
        style={{
          fontFamily: '"Arial", "Helvetica Neue", Helvetica, sans-serif',
          fontSize: "clamp(0.85rem, 2vw, 1.05rem)",
          fontWeight: "600",
          color: "#8B0000",
          letterSpacing: "0.02em",
          marginTop: "6px",
        }}
      >
        Committee Members List for the term 2025 – 2027
      </p>

      {/* ── BOTTOM RULE: thin + thick flat lines ───────── */}
      <div className="mt-4">
        <div style={{ height: "1px", backgroundColor: "#8B0000" }} />
        <div style={{ height: "3px", backgroundColor: "#8B0000", marginTop: "2px" }} />
      </div>
    </header>
  );
}

/* ═══════════════════════════════════════════════════════
   PAGE — MembersList
═══════════════════════════════════════════════════════ */
export default function MembersList() {
  const { data, loading, error, reload } = useFetchList(publicApi.getMembers);

  return (
    /* Institutional off-white background */
    <div className="min-h-screen" style={{ backgroundColor: "#f3f3f3" }}>
      <main className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-10">

        {/* ① Institutional header */}
        <InstitutionalHeader />

        {/* ② Loading state — row-shaped skeletons */}
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

        {/* ④ Members document list */}
        {!loading && !error && (
          data.length > 0 ? (
            <section aria-label="Committee members" className="mt-5">
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

        {/* ⑤ OFFICE BEARERS — static section ─────────────── */}
        <OfficeBearersSection />

        {/* ⑥ COMMITTEE MEMBERS BY DIVISION — static ──────── */}
        <DivisionMembersSection />

        {/* ⑦ Footer attestation */}
        <footer style={{
          marginTop: "32px",
          borderTop: `1px solid ${CLR_SILVER}`,
          paddingTop: "12px",
          textAlign: "center",
          fontSize: "11px",
          color: "#888888",
          fontFamily: FONT_SERIF,
        }}>
          Official Committee Members List &middot; The Institution of Engineers (India)
          &middot; Kanyakumari Local Centre
        </footer>
      </main>
    </div>
  );
}
