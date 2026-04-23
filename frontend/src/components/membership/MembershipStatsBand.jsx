export default function MembershipStatsBand({ metrics }) {
  const items = [
    { value: "1920", label: "Institution Founded" },
    { value: String(metrics?.serviceCount || 0), label: "Service Modules" },
    { value: String(metrics?.activityCount || 0), label: "Published Activities" },
    { value: String(metrics?.noticeCount || 0), label: "Announcements" },
  ];

  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <article key={item.label} className="rounded-xl border border-gray-200 bg-white px-4 py-4">
          <p className="text-2xl font-semibold tracking-tight text-gray-900">{item.value}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.12em] text-gray-400">{item.label}</p>
        </article>
      ))}
    </section>
  );
}
