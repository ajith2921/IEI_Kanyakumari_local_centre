/**
 * ConferenceBadge
 * Displays a dynamic animated pill badge based on how close the deadline is.
 * - ≤ 3 days  → "LAST DATE"   (red pulse)
 * - ≤ 10 days → "CLOSING SOON" (amber pulse)
 * - Otherwise  → "NEW"          (emerald pulse)
 */
export default function ConferenceBadge({ registrationDeadline, isNew }) {
  const deadlineRaw = String(registrationDeadline || "").trim();
  if (!deadlineRaw) {
    return isNew ? (
      <span className="conf-badge conf-badge--new" aria-label="Conference status: NEW">
        <span className="conf-badge__dot conf-badge__dot--new" aria-hidden="true" />
        NEW
      </span>
    ) : null;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadline = new Date(deadlineRaw);
  if (Number.isNaN(deadline.getTime())) {
    return isNew ? (
      <span className="conf-badge conf-badge--new" aria-label="Conference status: NEW">
        <span className="conf-badge__dot conf-badge__dot--new" aria-hidden="true" />
        NEW
      </span>
    ) : null;
  }

  deadline.setHours(0, 0, 0, 0);
  const daysLeft = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));

  let label, colorClass, dotColor;

  if (daysLeft <= 3) {
    label     = "LAST DATE";
    colorClass = "conf-badge--urgent";
    dotColor   = "conf-badge__dot--urgent";
  } else if (daysLeft <= 10) {
    label     = "CLOSING SOON";
    colorClass = "conf-badge--warning";
    dotColor   = "conf-badge__dot--warning";
  } else {
    label     = "NEW";
    colorClass = "conf-badge--new";
    dotColor   = "conf-badge__dot--new";
  }

  if (!isNew && daysLeft > 10) return null;

  return (
    <span className={`conf-badge ${colorClass}`} aria-label={`Conference status: ${label}`}>
      <span className={`conf-badge__dot ${dotColor}`} aria-hidden="true" />
      {label}
    </span>
  );
}
