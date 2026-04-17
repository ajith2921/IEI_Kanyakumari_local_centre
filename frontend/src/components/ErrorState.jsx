import Button from "./ui/Button";

export default function ErrorState({
  message = "Failed to load data.",
  onRetry,
  retryLabel = "Try again",
}) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50/90 p-5 text-sm text-red-700">
      <p className="font-semibold">Unable to complete request</p>
      <p className="mt-1 text-red-600">{message}</p>
      {onRetry && (
        <Button type="button" onClick={onRetry} variant="danger" size="sm" className="mt-3">
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
