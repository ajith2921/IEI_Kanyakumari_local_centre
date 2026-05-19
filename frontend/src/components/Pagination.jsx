import Button from "./ui/Button";

export default function Pagination({
  page,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
  loading = false,
}) {
  if (totalPages <= 1) return null;

  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalCount);

  return (
    <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-200 px-4 py-6 sm:flex-row">
      <p className="text-sm text-gray-600">
        Showing <span className="font-medium">{startItem}</span> to{" "}
        <span className="font-medium">{endItem}</span> of{" "}
        <span className="font-medium">{totalCount}</span> items
      </p>

      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1 || loading}
          className="!h-9 !px-3"
        >
          ← Previous
        </Button>

        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }).map((_, i) => {
            const pageNum = i + 1;
            const isActive = pageNum === page;
            const isVisible =
              pageNum === 1 ||
              pageNum === totalPages ||
              Math.abs(pageNum - page) <= 1;

            if (!isVisible) {
              if (pageNum === 2 && page > 3) {
                return (
                  <span key="ellipsis-start" className="px-2 text-gray-400">
                    …
                  </span>
                );
              }
              if (pageNum === totalPages - 1 && page < totalPages - 2) {
                return (
                  <span key="ellipsis-end" className="px-2 text-gray-400">
                    …
                  </span>
                );
              }
              return null;
            }

            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                disabled={loading}
                className={`inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-gray-900 text-white"
                    : "border border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages || loading}
          className="!h-9 !px-3"
        >
          Next →
        </Button>
      </div>
    </div>
  );
}
