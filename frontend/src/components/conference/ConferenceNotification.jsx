import { useState, useEffect, useCallback, memo } from "react";
import ConferenceBadge from "./ConferenceBadge";
import ConferenceButton from "./ConferenceButton";
import { publicApi } from "../../services/api";

/* ─────────────────────────────────────────────────────────────────────────────
   CONFERENCE DATA
   Initially hardcoded as a fallback.
───────────────────────────────────────────────────────────────────────────── */
const FALLBACK_CONFERENCE = {
  id: 1,
  title: "Advancing Science & Technology for SDGs",
  shortTitle: "SUSTAIN-TECH 2026",
  startDate: "2026-10-30",
  endDate: "2026-10-31",
  registrationDeadline: "2026-09-30",
  venue: "IEI KKLC Region",
  status: "active",
  description: "Engineering Sustainable Futures Through Innovation and Collaboration.",
  buttonText: "More Details",
  link: "/conference-overview",
  isNew: true,
};

/* ─────────────────────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────────────────────── */
const STORAGE_KEY = (id) => `conf_dismissed_${id}`;

function formatDate(dateStr) {
  if (!dateStr) return "TBA";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) {
    return "TBA";
  }
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
  if (Number.isNaN(deadline.getTime())) {
    return false;
  }
  deadline.setHours(0, 0, 0, 0);
  return today <= deadline;
}

function parseConferenceDate(value) {
  const text = String(value || "").trim();
  if (!text) return Number.NaN;

  const parsed = Date.parse(text);
  if (Number.isFinite(parsed)) {
    return parsed;
  }

  const parts = text.split(/[-/]/);
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);

    if (year > 1900 && month >= 0 && month <= 11 && day >= 1 && day <= 31) {
      return new Date(year, month, day).getTime();
    }
  }

  return Number.NaN;
}

function pickNearestUpcomingConference(conferences, todayStartMs) {
  return conferences
    .map((conference) => ({ conference, time: parseConferenceDate(conference?.start_date || conference?.startDate) }))
    .filter(({ time }) => Number.isFinite(time) && time >= todayStartMs)
    .sort((left, right) => left.time - right.time)[0]?.conference || null;
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────────────────── */
function ConferenceNotification() {
  const [conference, setConference] = useState(null);
  const [dismissed, setDismissed] = useState(false);
  const [visible, setVisible] = useState(false); // drives CSS entry animation

  useEffect(() => {
    const todayStartMs = new Date(new Date().setHours(0, 0, 0, 0)).getTime();

    publicApi.getConferences()
      .then((res) => {
        const conferences = Array.isArray(res?.data) ? res.data : [];
        const selected = pickNearestUpcomingConference(conferences, todayStartMs) || conferences.find((item) => item?.status === "active") || null;
        const data = selected || FALLBACK_CONFERENCE;
        const conf = {
          id: data.id,
          title: data.title,
          shortTitle: data.short_title,
          startDate: data.start_date,
          endDate: data.end_date,
          registrationDeadline: data.registration_deadline,
          venue: data.venue,
          status: data.status,
          description: data.description,
          buttonText: data.button_text,
          link: data.pdf_url || (data.link && data.link.trim() !== "/conference-overview" ? data.link : "/conference-overview"),
          isNew: data.is_new,
        };
        setConference(conf);
        setDismissed(localStorage.getItem(STORAGE_KEY(conf.id)) === "true");
      })
      .catch(() => {
        const conf = FALLBACK_CONFERENCE;
        setConference(conf);
        setDismissed(localStorage.getItem(STORAGE_KEY(conf.id)) === "true");
      });
  }, []);

  /* Trigger entry animation after a short delay */
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 400);
    return () => clearTimeout(t);
  }, []);

  const handleDismiss = useCallback(() => {
    if (conference?.id != null) {
      localStorage.setItem(STORAGE_KEY(conference.id), "true");
    }
    setDismissed(true);
  }, [conference]);

  /* Visibility gate */
  if (!conference || dismissed) return null;

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

export default memo(ConferenceNotification);
