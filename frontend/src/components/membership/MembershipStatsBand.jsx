const statIcons = [
  // Trophy
  <svg key="0" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
    <path fillRule="evenodd" d="M10 1a.75.75 0 0 1 .75.75v.5h3.5a.75.75 0 0 1 0 1.5H13.7l-.6 3.9A4 4 0 0 1 10 11a4 4 0 0 1-3.1-3.35L6.3 3.75H4.75a.75.75 0 0 1 0-1.5h3.5v-.5A.75.75 0 0 1 10 1ZM5.5 14.5a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1-.75-.75ZM7.25 17a.75.75 0 0 1 .75-.75h4a.75.75 0 0 1 0 1.5h-4A.75.75 0 0 1 7.25 17Z" clipRule="evenodd" />
  </svg>,
  // Grid
  <svg key="1" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
    <path d="M2 4.5A2.5 2.5 0 0 1 4.5 2h2A2.5 2.5 0 0 1 9 4.5v2A2.5 2.5 0 0 1 6.5 9h-2A2.5 2.5 0 0 1 2 6.5v-2ZM2 13.5A2.5 2.5 0 0 1 4.5 11h2A2.5 2.5 0 0 1 9 13.5v2A2.5 2.5 0 0 1 6.5 18h-2A2.5 2.5 0 0 1 2 15.5v-2ZM11 4.5A2.5 2.5 0 0 1 13.5 2h2A2.5 2.5 0 0 1 18 4.5v2A2.5 2.5 0 0 1 15.5 9h-2A2.5 2.5 0 0 1 11 6.5v-2ZM11 13.5A2.5 2.5 0 0 1 13.5 11h2A2.5 2.5 0 0 1 18 13.5v2A2.5 2.5 0 0 1 15.5 18h-2A2.5 2.5 0 0 1 11 15.5v-2Z" />
  </svg>,
  // Calendar
  <svg key="2" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
    <path d="M5.25 12a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-.75.75H6a.75.75 0 0 1-.75-.75V12ZM6 13.25a.75.75 0 0 0-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 0 0 .75-.75V14a.75.75 0 0 0-.75-.75H6ZM9.25 12a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-.75.75H10a.75.75 0 0 1-.75-.75V12ZM10 13.25a.75.75 0 0 0-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 0 0 .75-.75V14a.75.75 0 0 0-.75-.75H10ZM13.25 10a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-.75.75H14a.75.75 0 0 1-.75-.75V10ZM14 11.25a.75.75 0 0 0-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 0 0 .75-.75V12a.75.75 0 0 0-.75-.75H14Z" />
    <path fillRule="evenodd" d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z" clipRule="evenodd" />
  </svg>,
  // Bell
  <svg key="3" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
    <path d="M4.214 3.227a.75.75 0 0 0-1.156-.956 8.97 8.97 0 0 0-1.856 3.826.75.75 0 0 0 1.466.316 7.47 7.47 0 0 1 1.546-3.186ZM16.942 2.271a.75.75 0 0 0-1.156.956 7.47 7.47 0 0 1 1.546 3.186.75.75 0 0 0 1.466-.316 8.971 8.971 0 0 0-1.856-3.826Z" />
    <path fillRule="evenodd" d="M10 2a6 6 0 0 0-6 6c0 1.887-.454 3.665-1.257 5.234a.75.75 0 0 0 .515 1.076 32.91 32.91 0 0 0 3.256.508 3.5 3.5 0 0 0 6.972 0 32.903 32.903 0 0 0 3.256-.508.75.75 0 0 0 .515-1.076A11.448 11.448 0 0 1 16 8a6 6 0 0 0-6-6Zm0 14.5a2 2 0 0 1-1.95-1.557 33.54 33.54 0 0 0 3.9 0A2 2 0 0 1 10 16.5Z" clipRule="evenodd" />
  </svg>,
];

const accentColors = [
  { bar: "bg-[#f4c430]", icon: "text-[#f4c430] bg-[#f4c430]/15", num: "text-[#0b3a67]" },
  { bar: "bg-[#0b3a67]/40", icon: "text-[#0b3a67] bg-[#0b3a67]/10", num: "text-[#0b3a67]" },
  { bar: "bg-[#0b3a67]/30", icon: "text-[#0b3a67] bg-[#0b3a67]/10", num: "text-[#0b3a67]" },
  { bar: "bg-[#0b3a67]/20", icon: "text-[#0b3a67] bg-[#0b3a67]/10", num: "text-[#0b3a67]" },
];

export default function MembershipStatsBand({ metrics }) {
  const items = [
    { value: "1920", label: "Institution Founded", suffix: "" },
    { value: String(metrics?.serviceCount || 6), label: "Service Modules", suffix: "+" },
    { value: String(metrics?.activityCount || 0), label: "Published Activities", suffix: "" },
    { value: String(metrics?.noticeCount || 0), label: "Announcements", suffix: "" },
  ];

  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item, index) => {
        const theme = accentColors[index];
        return (
          <article
            key={item.label}
            className="premium-panel flex flex-col gap-3 rounded-2xl px-5 py-5 transition-shadow hover:shadow-[0_18px_40px_-26px_rgba(11,58,103,0.65)]"
          >
            <div className="flex items-center justify-between">
              <span className={`inline-flex h-8 w-8 items-center justify-center rounded-xl ${theme.icon}`}>
                {statIcons[index]}
              </span>
              <span className={`block h-1 w-10 rounded-full ${theme.bar}`} />
            </div>
            <div>
              <p className={`text-2xl font-bold tracking-tight ${theme.num}`}>
                {item.value}
                {item.suffix && <span className="text-lg">{item.suffix}</span>}
              </p>
              <p className="mt-0.5 text-xs uppercase tracking-[0.12em] text-[#67809a]">{item.label}</p>
            </div>
          </article>
        );
      })}
    </section>
  );
}
