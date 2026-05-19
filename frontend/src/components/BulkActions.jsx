import Button from "./ui/Button";

export default function BulkActions({
  selectedCount = 0,
  onDelete,
  onExport,
  loading = false,
  entityName = "items",
}) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 z-50 flex items-center justify-between rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 shadow-lg sm:left-auto sm:right-6 sm:w-auto">
      <p className="text-sm font-medium text-yellow-800">
        {selectedCount} {selectedCount === 1 ? entityName : `${entityName}s`} selected
      </p>

      <div className="flex gap-2">
        {onExport && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onExport}
            disabled={loading}
            className="!h-8 !px-3 !text-xs"
          >
            Export
          </Button>
        )}

        {onDelete && (
          <Button
            variant="danger"
            size="sm"
            onClick={onDelete}
            disabled={loading}
            className="!h-8 !px-3 !text-xs"
          >
            Delete
          </Button>
        )}
      </div>
    </div>
  );
}
