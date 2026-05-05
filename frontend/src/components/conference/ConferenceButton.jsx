import { Link } from "react-router-dom";

/**
 * ConferenceButton
 * Renders either an internal React Router <Link> or an external <a>.
 */
export default function ConferenceButton({ href, children, external = false }) {
  const cls = "conf-cta-btn";

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cls}
        aria-label={typeof children === "string" ? children : "Conference registration"}
      >
        {children}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="conf-cta-btn__icon"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M5 12h10M12 7l5 5-5 5" />
        </svg>
      </a>
    );
  }

  return (
    <Link to={href} className={cls}>
      {children}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="conf-cta-btn__icon"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M5 12h10M12 7l5 5-5 5" />
      </svg>
    </Link>
  );
}
