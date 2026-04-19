export default function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  className = "",
  contentWidthClassName = "max-w-2xl",
  titleAs = "h2",
}) {
  const TitleTag = titleAs;

  return (
    <div className={`mb-14 flex flex-wrap items-end justify-between gap-6 ${className}`.trim()}>
      <div className={contentWidthClassName}>
        {eyebrow && (
          <p className="eyebrow-chip mb-3">{eyebrow}</p>
        )}
        <TitleTag className="heading-h2 text-gray-900">{title}</TitleTag>
        {description && (
          <p className="mt-3 text-base leading-relaxed text-gray-500">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
