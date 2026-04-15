export function SkeletonCard({ showMedia = true }) {
  return (
    <article className="section-card overflow-hidden p-4">
      {showMedia && <div className="skeleton mb-4 h-40 w-full" />}
      <div className="space-y-2">
        <div className="skeleton h-4 w-2/3" />
        <div className="skeleton h-3 w-1/2" />
        <div className="skeleton h-3 w-full" />
        <div className="skeleton h-3 w-5/6" />
      </div>
    </article>
  );
}

export function SkeletonGrid({ count = 3, showMedia = true }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} showMedia={showMedia} />
      ))}
    </div>
  );
}

export function SkeletonRows({ count = 4 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="section-card p-4">
          <div className="skeleton mb-2 h-4 w-1/3" />
          <div className="skeleton h-3 w-11/12" />
        </div>
      ))}
    </div>
  );
}
