export default function LoadingSpinner({ text = "Loading content..." }) {
  return (
    <div className="flex min-h-[180px] flex-col items-center justify-center gap-3 rounded-2xl border border-brand-100 bg-white">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-700" />
      <p className="text-sm font-semibold text-brand-700">{text}</p>
    </div>
  );
}
