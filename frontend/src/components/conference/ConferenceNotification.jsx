import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { publicApi, toAbsoluteUploadUrl } from "../../services/api";

const STORAGE_PREFIX = "conference_banner_dismissed";

function createStorageKey(conference) {
  return `${STORAGE_PREFIX}_${conference?.id || "default"}_${conference?.conferenceDate || "unknown"}`;
}

function formatDate(value) {
  if (!value) return "TBA";
  const date = parseConferenceDate(value);
  return date
    ? date.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : "TBA";
}

/**
 * Robustly parse a date string in YYYY-MM-DD, DD-MM-YYYY, or DD/MM/YYYY format.
 * Returns a Date object or null if unparseable.
 */
function parseConferenceDate(value) {
  if (!value) return null;
  const s = String(value).trim();

  // Try native ISO parse first (YYYY-MM-DD)
  const iso = new Date(s);
  if (!Number.isNaN(iso.getTime())) return iso;

  // Fallback: DD-MM-YYYY or DD/MM/YYYY
  const parts = s.split(/[-/]/);
  if (parts.length === 3) {
    const [a, b, c] = parts.map(Number);
    // Detect DD-MM-YYYY: first part must be > 12 OR year-like in third part
    if (c > 1900 && a >= 1 && a <= 31 && b >= 1 && b <= 12) {
      const d = new Date(c, b - 1, a);
      if (!Number.isNaN(d.getTime())) return d;
    }
  }
  return null;
}

function normalizeConference(data) {
  if (!data) return null;

  return {
    id: data.id,
    title: data.title || data.short_title || "Upcoming Conference",
    description: data.description || "Details will be announced soon.",
    conferenceDate: data.start_date,
    endDate: data.end_date,
    lastDate: data.registration_deadline,
    registrationLink: data.pdf_url || data.link || "",
    venue: data.venue || "Venue to be announced",
    status: data.status || "inactive",
    isNew: Boolean(data.is_new),
    buttonText: data.button_text || "More Details",
  };
}

/**
 * Checks if a normalized conference should be shown as notification.
 * The backend /conferences/active endpoint is the source of truth for
 * which conference is "active" — the frontend only checks if the
 * conference hasn't ended yet (dates still in future).
 */
function isConferenceActive(conference) {
  if (!conference) return false;

  // Respect admin's explicit "inactive" / "completed" status
  const status = String(conference.status || "").toLowerCase();
  if (status === "inactive" || status === "completed") return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const conferenceDate = parseConferenceDate(conference.conferenceDate);
  // If we can't parse the start date, still show the card (admin set it active)
  if (!conferenceDate) return true;

  const endDate = parseConferenceDate(conference.endDate);
  const hasEndDate = endDate !== null;

  // Use end date if available, otherwise use start date as the cutoff
  const cutoff = hasEndDate ? endDate : conferenceDate;
  cutoff.setHours(23, 59, 59, 999);

  return today <= cutoff;
}

function getRegistrationStatus(conference) {
  if (!conference) return { label: "Registration Closed", variant: "urgent" };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Use robust parser to handle both ISO and DD-MM-YYYY formats
  const lastDate = parseConferenceDate(conference.lastDate);
  if (!lastDate || today > lastDate) {
    return { label: "Registration Closed", variant: "urgent" };
  }

  const diffDays = Math.ceil((lastDate.getTime() - today.getTime()) / 86400000);
  if (diffDays <= 3) {
    return { label: "Closing Soon", variant: "warning" };
  }

  return { label: "Registration Open", variant: "new" };
}

export default function ConferenceNotification({ previewMode = false }) {
  const [conference, setConference] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadConference = async () => {
      setLoading(true);
      try {
        const response = await publicApi.getActiveConference();
        const normalized = normalizeConference(response.data);
        const nextConference = isConferenceActive(normalized)
          ? normalized
          : null;

        if (!mounted) return;

        setConference(nextConference);
        setDismissed(
          previewMode ? false : nextConference ? localStorage.getItem(createStorageKey(nextConference)) === "true" : false
        );
      } catch {
        if (!mounted) return;
        setConference(null);
        setDismissed(false);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadConference();

    const timer = window.setTimeout(() => setVisible(true), 120);

    return () => {
      mounted = false;
      window.clearTimeout(timer);
    };
  }, []);

  const handleDismiss = () => {
    if (conference) {
      localStorage.setItem(createStorageKey(conference), "true");
    }
    setDismissed(true);
  };

  const registerLink = useMemo(() => {
    if (!conference?.registrationLink) return null;

    const trimmed = conference.registrationLink.trim();
    // Treat old default/legacy paths as "no link"
    if (
      trimmed === "/conference-overview" ||
      trimmed === "/conference" ||
      trimmed === "/conferences" ||
      trimmed === ""
    ) {
      return null;
    }

    const isUploadPath = trimmed.startsWith("/uploads") || trimmed.startsWith("/storage");
    const external = trimmed.startsWith("http") || isUploadPath;

    return {
      external,
      href: isUploadPath ? toAbsoluteUploadUrl(trimmed) : trimmed,
    };
  }, [conference]);

  const shouldHide = !previewMode && dismissed;

  if (loading) {
    return (
      <section
        className={`conf-notification-wrapper ${visible ? "conf-notification-wrapper--visible" : ""}`}
        aria-label="Conference notification loading"
      >
        <div className="conf-card conf-card--loading animate-fade-up">
          <div className="conf-skeleton conf-skeleton--badge" />
          <div className="conf-skeleton conf-skeleton--title" />
          <div className="conf-skeleton conf-skeleton--text" />
          <div className="conf-skeleton conf-skeleton--text short" />
          <div className="conf-skeleton conf-skeleton--button" />
        </div>
      </section>
    );
  }

  if (!conference || shouldHide) return null;

  return (
    <section
      className={`conf-notification-wrapper ${visible ? "conf-notification-wrapper--visible" : ""} animate-fade-up`}
      aria-label="Upcoming conference notification"
    >
      <article className="conf-card" aria-live="polite">
        <div className="conf-card__pin" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M9 3h6l1 6 3 3-4 1-4 8-2-2 3-7-3-3 0-6Z" fill="currentColor" />
            <path d="M12 14v7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </div>

        <button
          type="button"
          className="conf-card__close"
          onClick={handleDismiss}
          aria-label="Dismiss conference notification"
        >
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
        </button>

        <div className="conf-card__toprow">
          <div className="conf-card__badges">
            {conference.isNew && <span className="conf-badge conf-badge--new">NEW</span>}
            {(() => {
              const { label, variant } = getRegistrationStatus(conference);
              return (
                <span className={`conf-badge conf-badge--${variant}`}>{label}</span>
              );
            })()}
          </div>
        </div>

        <div className="conf-card__content">
          <p className="conf-card__chip">Conference Notification</p>
          <h2 className="conf-card__title">{conference.title}</h2>
          <p className="conf-card__desc">{conference.description}</p>

          <div className="conf-card__divider" aria-hidden="true" />

          <dl className="conf-card__meta">
            <div className="conf-card__meta-row">
              <dt className="conf-card__meta-label">Conference Date</dt>
              <dd className="conf-card__meta-value">{formatDate(conference.conferenceDate)}</dd>
            </div>
            <div className="conf-card__meta-row">
              <dt className="conf-card__meta-label">Last Date to Register</dt>
              <dd className="conf-card__meta-value conf-card__meta-value--urgent">{formatDate(conference.lastDate)}</dd>
            </div>
            <div className="conf-card__meta-row">
              <dt className="conf-card__meta-label">Venue</dt>
              <dd className="conf-card__meta-value">{conference.venue}</dd>
            </div>
          </dl>

          <div className="conf-card__cta">
            {registerLink ? (
              registerLink.external ? (
                <a
                  href={registerLink.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="conf-cta-btn"
                >
                  <span>{conference.buttonText || "Register Now"}</span>
                  <svg className="conf-cta-btn__icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <path d="M5 10h10M11 6l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              ) : (
                <Link to={registerLink.href} className="conf-cta-btn">
                  <span>{conference.buttonText || "Register Now"}</span>
                  <svg className="conf-cta-btn__icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <path d="M5 10h10M11 6l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              )
            ) : (
              <Link to="/conferences" className="conf-cta-btn">
                <span>{conference.buttonText || "View Conference"}</span>
                <svg className="conf-cta-btn__icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path d="M5 10h10M11 6l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            )}
          </div>
        </div>

        <div className="conf-card__fold" aria-hidden="true" />
      </article>
    </section>
  );
}
