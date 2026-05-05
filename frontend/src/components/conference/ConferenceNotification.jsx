import { useState, useEffect, useCallback } from "react";
import ConferenceBadge from "./ConferenceBadge";
import ConferenceButton from "./ConferenceButton";

/* ─────────────────────────────────────────────────────────────────────────────
   CONFERENCE DATA
   Swap this out for an API call / props when backend is ready.
   Backend integration hint:
     useEffect(() => { fetch('/api/conferences/active').then(r=>r.json()).then(setConference) }, [])
───────────────────────────────────────────────────────────────────────────── */
const CONFERENCE_DATA = {
  id: 1,
  title: "Advancing Science & Technology for SDGs",
  shortTitle: "SUSTAIN-TECH 2026",
  startDate: "2026-10-30",
  endDate: "2026-10-31",
  registrationDeadline: "2026-09-30", // Educated guess based on timeline
  venue: "IEI KKLC Region",
  status: "active",   // "active" | "completed" | "cancelled"
  description: "Engineering Sustainable Futures Through Innovation and Collaboration.",
  buttonText: "More Details",
  link: "/conference",
  isNew: true,
};

/* ─────────────────────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────────────────────── */
const STORAGE_KEY = (id) => `conf_dismissed_${id}`;

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function isConferenceVisible(conference) {
  if (!conference) return false;
  if (conference.status !== "active") return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadline = new Date(conference.registrationDeadline);
  deadline.setHours(0, 0, 0, 0);
  return today <= deadline;
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────────────────── */
export default function ConferenceNotification() {
  const [conference, setConference] = useState(CONFERENCE_DATA);
  const [dismissed, setDismissed] = useState(false);
  const [visible, setVisible] = useState(false); // drives CSS entry animation

  /* Backend integration point: replace this effect with a real fetch */
  useEffect(() => {
    // TODO: fetch('/api/conferences/active').then(r=>r.json()).then(setConference);
    setConference(CONFERENCE_DATA);
  }, []);

  /* Trigger entry animation after a short delay */
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 400);
    return () => clearTimeout(t);
  }, []);

  const handleDismiss = useCallback(() => {
    setDismissed(true);
  }, []);

  /* Visibility gate */
  if (!isConferenceVisible(conference) || dismissed) return null;

  const isExternal = conference.link?.startsWith("http");

  return (
    <div
      className={`conf-notification-wrapper ${visible ? "conf-notification-wrapper--visible" : ""}`}
      role="complementary"
      aria-label="Conference notification"
    >
      {/* Sticky note card */}
      <article className="conf-card" aria-live="polite">

        {/* Folded corner decoration */}
        <div className="conf-card__fold" aria-hidden="true" />

        {/* Top row: Badge + Close */}
        <div className="conf-card__toprow">
          <ConferenceBadge
            registrationDeadline={conference.registrationDeadline}
            isNew={conference.isNew}
          />
          <button
            onClick={handleDismiss}
            className="conf-card__close"
            aria-label="Dismiss conference notification"
            type="button"
          >
            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Short title chip */}
        <p className="conf-card__chip">{conference.shortTitle}</p>

        {/* Full title */}
        <h2 className="conf-card__title">{conference.title}</h2>

        {/* Divider */}
        <div className="conf-card__divider" aria-hidden="true" />

        {/* Meta info */}
        <dl className="conf-card__meta">
          <div className="conf-card__meta-row">
            <dt className="conf-card__meta-label">
              <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="conf-meta-icon">
                <rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.3" />
                <path d="M2 7h12M5 1v4M11 1v4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
              Dates
            </dt>
            <dd className="conf-card__meta-value">
              {formatDate(conference.startDate)} – {formatDate(conference.endDate)}
            </dd>
          </div>

          <div className="conf-card__meta-row">
            <dt className="conf-card__meta-label">
              <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="conf-meta-icon">
                <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3" />
                <path d="M8 5v3.5L10.5 11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
              Deadline
            </dt>
            <dd className="conf-card__meta-value conf-card__meta-value--urgent">
              {formatDate(conference.registrationDeadline)}
            </dd>
          </div>
        </dl>

        {/* CTA */}
        <div className="conf-card__cta">
          <ConferenceButton href={conference.link} external={isExternal}>
            {conference.buttonText}
          </ConferenceButton>
        </div>
      </article>
    </div>
  );
}
