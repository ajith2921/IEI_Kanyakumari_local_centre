import Card from "./ui/Card";

export function SkeletonCard({ showMedia = true }) {
  return (
    <Card className="overflow-hidden p-4" padded={false}>
      {showMedia && <div className="skeleton mb-4 h-40 w-full" />}
      <div className="space-y-2">
        <div className="skeleton h-4 w-2/3" />
        <div className="skeleton h-3 w-1/2" />
        <div className="skeleton h-3 w-full" />
        <div className="skeleton h-3 w-5/6" />
      </div>
    </Card>
  );
}

export function SkeletonGrid({ count = 3, showMedia = true }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
        <Card key={index} as="div" className="p-4" padded={false}>
          <div className="skeleton mb-2 h-4 w-1/3" />
          <div className="skeleton h-3 w-11/12" />
        </Card>
      ))}
    </div>
  );
}
