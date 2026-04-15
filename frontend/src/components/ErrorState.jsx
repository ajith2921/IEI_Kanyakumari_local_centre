export default function ErrorState({
  message = "Failed to load data.",
  onRetry,
  retryLabel = "Try again",
}) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
      <p className="font-semibold">Unable to complete request</p>
      <p className="mt-1">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="focus-ring mt-3 rounded-lg border border-red-300 px-3 py-1.5 font-semibold text-red-700 hover:bg-red-100"
        >
          {retryLabel}
        </button>
      )}
    </div>
  );
}
