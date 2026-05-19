import { useEffect, useState } from "react";
import { adminApi, parseApiError } from "../services/api";

export default function DashboardStats() {
  const [stats, setStats] = useState({
    members: 0,
    activities: 0,
    gallery: 0,
    newsletters: 0,
    downloads: 0,
    facilities: 0,
    contacts: 0,
    conferences: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [members, activities, gallery, newsletters, downloads, facilities, contacts, conferences] =
          await Promise.all([
            adminApi.members.list().catch(() => ({ data: [] })),
            adminApi.activities.list().catch(() => ({ data: [] })),
            adminApi.gallery.list().catch(() => ({ data: [] })),
            adminApi.newsletters.list().catch(() => ({ data: [] })),
            adminApi.downloads.list().catch(() => ({ data: [] })),
            adminApi.facilities.list().catch(() => ({ data: [] })),
            adminApi.contacts.list().catch(() => ({ data: [] })),
            adminApi.conferences.list().catch(() => ({ data: [] })),
          ]);

        setStats({
          members: Array.isArray(members.data) ? members.data.length : members.data?.items?.length || 0,
          activities: Array.isArray(activities.data) ? activities.data.length : activities.data?.items?.length || 0,
          gallery: Array.isArray(gallery.data) ? gallery.data.length : gallery.data?.items?.length || 0,
          newsletters: Array.isArray(newsletters.data) ? newsletters.data.length : newsletters.data?.items?.length || 0,
          downloads: Array.isArray(downloads.data) ? downloads.data.length : downloads.data?.items?.length || 0,
          facilities: Array.isArray(facilities.data) ? facilities.data.length : facilities.data?.items?.length || 0,
          contacts: Array.isArray(contacts.data) ? contacts.data.length : contacts.data?.items?.length || 0,
          conferences: Array.isArray(conferences.data) ? conferences.data.length : conferences.data?.items?.length || 0,
        });
      } catch (error) {
        console.error("Failed to fetch stats:", parseApiError(error));
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statItems = [
    { label: "Members", value: stats.members, icon: "👥", color: "blue" },
    { label: "Activities", value: stats.activities, icon: "📅", color: "green" },
    { label: "Gallery Items", value: stats.gallery, icon: "🖼️", color: "purple" },
    { label: "Newsletters", value: stats.newsletters, icon: "📧", color: "orange" },
    { label: "Downloads", value: stats.downloads, icon: "⬇️", color: "red" },
    { label: "Facilities", value: stats.facilities, icon: "🏢", color: "indigo" },
    { label: "Messages", value: stats.contacts, icon: "💬", color: "pink" },
    { label: "Conferences", value: stats.conferences, icon: "🎤", color: "cyan" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statItems.map((item) => (
        <div
          key={item.label}
          className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{item.label}</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {loading ? "—" : item.value}
              </p>
            </div>
            <div className="text-3xl">{item.icon}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
