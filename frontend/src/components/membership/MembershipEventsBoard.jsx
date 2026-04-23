import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../ui/Button";

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatDate(value) {
  if (!value) return "Date To Be Announced";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date To Be Announced";
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function buildMonthCells(referenceDate, activeDays) {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const cells = [];

  for (let i = 0; i < firstDay; i += 1) {
    cells.push({ day: "", isActive: false });
  }

  for (let day = 1; day <= totalDays; day += 1) {
    cells.push({ day, isActive: activeDays.has(day) });
  }

  while (cells.length % 7 !== 0) {
    cells.push({ day: "", isActive: false });
  }

  return cells;
}

export default function MembershipEventsBoard({ activities = [], loading = false }) {
  const [view, setView] = useState("list");

  const sortedActivities = useMemo(() => {
    return [...activities]
      .filter((item) => item?.title)
      .sort((a, b) => {
        const aTime = new Date(a.event_date || 0).getTime();
        const bTime = new Date(b.event_date || 0).getTime();
        return aTime - bTime;
      });
  }, [activities]);

  const currentMonth = new Date();
  const activeDays = useMemo(() => {
    const days = new Set();
    sortedActivities.forEach((item) => {
      const date = new Date(item.event_date || "");
      if (
        !Number.isNaN(date.getTime()) &&
        date.getMonth() === currentMonth.getMonth() &&
        date.getFullYear() === currentMonth.getFullYear()
      ) {
        days.add(date.getDate());
      }
    });
    return days;
  }, [sortedActivities, currentMonth]);

  const monthCells = useMemo(() => buildMonthCells(currentMonth, activeDays), [currentMonth, activeDays]);

  return (
    <section className="premium-panel rounded-2xl p-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow-chip">Upcoming Events</p>
          <h3 className="mt-2 text-xl font-semibold text-gray-900">Events and Calendar Desk</h3>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setView("list")}
            variant={view === "list" ? "primary" : "secondary"}
            size="sm"
          >
            List View
          </Button>
          <Button
            onClick={() => setView("calendar")}
            variant={view === "calendar" ? "primary" : "secondary"}
            size="sm"
          >
            Calendar View
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
              <div className="skeleton h-3 w-24 rounded-md" />
              <div className="skeleton mt-2 h-4 w-3/4 rounded-md" />
              <div className="skeleton mt-2 h-3 w-full rounded-md" />
            </div>
          ))}
        </div>
      ) : view === "list" ? (
        <div className="space-y-3">
          {sortedActivities.slice(0, 6).map((item) => (
            <article key={item.id} className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 transition-shadow hover:shadow-[0_4px_14px_-6px_rgba(11,58,103,0.2)]">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-gray-400">
                {formatDate(item.event_date)}
              </p>
              <p className="mt-1 text-sm font-semibold text-gray-900">{item.title}</p>
              <p className="mt-1 text-sm text-gray-500 line-clamp-2">{item.description || "Details to be announced."}</p>
            </article>
          ))}
          {sortedActivities.length === 0 && (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center">
              <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8 text-gray-300" aria-hidden="true">
                <path d="M8 2v3M16 2v3M3.5 9.09h17M21 8.5V17c0 3-1.5 5-5 5H8c-3.5 0-5-2-5-5V8.5c0-3 1.5-5 5-5h8c3.5 0 5 2 5 5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="text-sm font-medium text-gray-500">No upcoming activities published yet.</p>
              <p className="text-xs text-gray-400">Events will appear here once the chapter schedules them.</p>
            </div>
          )}
        </div>
      ) : (
        <div>
          <p className="mb-3 text-sm font-medium text-gray-700">
            {currentMonth.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
          </p>
          <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-400">
            {weekDays.map((day) => (
              <div key={day} className="py-1 font-medium">
                {day}
              </div>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {monthCells.map((cell, index) => (
              <div
                key={`${cell.day}-${index}`}
                className={`rounded-md border px-0.5 py-2 text-center text-xs ${
                  cell.day === ""
                    ? "border-transparent bg-transparent"
                    : cell.isActive
                      ? "border-gray-900 bg-gray-900 text-white"
                      : "border-gray-200 bg-gray-50 text-gray-600"
                }`}
              >
                {cell.day}
              </div>
            ))}
          </div>
        </div>
      )}

      <Button as={Link} to="/membership/events-cpd" variant="secondary" className="mt-4">
        Open Events and CPD Page
      </Button>
    </section>
  );
}
