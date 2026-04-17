export default function SectionHeader({ eyebrow, title, description, action }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 md:mb-10">
      <div className="max-w-3xl">
        {eyebrow && <p className="eyebrow-chip mb-3">{eyebrow}</p>}
        <h2 className="heading-h2 mb-3 font-semibold text-gray-900">{title}</h2>
        <div className="mb-4 h-1 w-14 rounded-full bg-gradient-to-r from-brand-600 to-blue-500" />
        {description && <p className="muted-text text-base">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
