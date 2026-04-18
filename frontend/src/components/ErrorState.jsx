import Button from "./ui/Button";

export default function ErrorState({
  message = "Failed to load data.",
  onRetry,
  retryLabel = "Try again",
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 text-sm text-gray-600">
      <p className="font-medium text-gray-900">Unable to complete request</p>
      <p className="mt-2 text-gray-500">{message}</p>
      {onRetry && (
        <Button type="button" onClick={onRetry} variant="secondary" className="mt-4">
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
