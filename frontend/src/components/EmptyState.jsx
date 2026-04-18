export default function EmptyState({
  title = "Nothing to show",
  description = "Content will appear here when available.",
  className = "",
}) {
  return (
    <div className={`empty-state ${className}`.trim()}>
      <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white">
        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-gray-400" aria-hidden="true">
          <path
            d="M5 7.5A2.5 2.5 0 0 1 7.5 5h9A2.5 2.5 0 0 1 19 7.5v9a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 5 16.5v-9Z"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path d="M8.5 14.5 10.5 12l2 2 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="9" cy="9" r="1" fill="currentColor" />
        </svg>
      </div>
      <p className="text-base font-medium text-gray-900">{title}</p>
      <p className="mt-2 text-sm text-gray-500">{description}</p>
    </div>
  );
}
