import { useEffect, useState } from "react";
import { adminApi, parseApiError } from "../services/api";
import Card from "../ui/Card";
import ErrorState from "../components/ErrorState";

/**
 * Admin Analytics Dashboard
 * Shows insights about content performance and engagement
 */
export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState({
    recentActivities: [],
    topMembers: [],
    upcomingEvents: [],
    recentlyAdded: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError("");

        // Fetch all data in parallel
        const [activities, members, conferences, contacts] = await Promise.all([
          adminApi.activities.list().catch(() => ({ data: [] })),
          adminApi.members.list().catch(() => ({ data: [] })),
          adminApi.conferences.list().catch(() => ({ data: [] })),
          adminApi.contacts.list().catch(() => ({ data: [] })),
        ]);

        // Extract items properly (handle both array and paginated responses)
        const getItems = (data) => (Array.isArray(data) ? data : data.items || []);
        
        const activitiesList = getItems(activities.data);
        const membersList = getItems(members.data);
        const conferencesList = getItems(conferences.data);
        const contactsList = getItems(contacts.data);

        setAnalytics({
          recentActivities: activitiesList
            .sort((a, b) => new Date(b.date || b.created_at) - new Date(a.date || a.created_at))
            .slice(0, 5),
          topMembers: membersList.slice(0, 5),
          upcomingEvents: conferencesList
            .filter((e) => new Date(e.end_date || e.date) > new Date())
            .slice(0, 5),
          recentlyAdded: [
            ...activitiesList.slice(0, 2),
            ...membersList.slice(0, 2),
          ]
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 5),
        });
      } catch (err) {
        setError(parseApiError(err));
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-4">
            <div className="skeleton h-6 w-1/3 mb-4" />
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="skeleton h-4 w-full" />
              ))}
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Recent Activities */}
      <Card className="p-4">
        <h3 className="mb-4 font-semibold text-gray-900">Recent Activities</h3>
        <div className="space-y-3">
          {analytics.recentActivities.length === 0 ? (
            <p className="text-sm text-gray-500">No activities yet</p>
          ) : (
            analytics.recentActivities.map((activity, i) => (
              <div key={i} className="border-l-4 border-blue-500 pl-3">
                <p className="text-sm font-medium text-gray-900">{activity.title || activity.name}</p>
                <p className="text-xs text-gray-500">
                  {new Date(activity.date || activity.created_at).toLocaleDateString()}
                </p>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Top Members */}
      <Card className="p-4">
        <h3 className="mb-4 font-semibold text-gray-900">Committee Members</h3>
        <div className="space-y-3">
          {analytics.topMembers.length === 0 ? (
            <p className="text-sm text-gray-500">No members yet</p>
          ) : (
            analytics.topMembers.map((member, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {member.image_url && (
                    <img
                      src={member.image_url}
                      alt={member.name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">{member.name}</p>
                    <p className="text-xs text-gray-500">{member.position || member.email}</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-brand-700">#{i + 1}</span>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Upcoming Events */}
      <Card className="p-4">
        <h3 className="mb-4 font-semibold text-gray-900">Upcoming Conferences</h3>
        <div className="space-y-3">
          {analytics.upcomingEvents.length === 0 ? (
            <p className="text-sm text-gray-500">No upcoming events</p>
          ) : (
            analytics.upcomingEvents.map((event, i) => (
              <div key={i} className="border-l-4 border-green-500 pl-3">
                <p className="text-sm font-medium text-gray-900">{event.title || event.name}</p>
                <p className="text-xs text-gray-500">
                  {new Date(event.start_date || event.date).toLocaleDateString()}
                </p>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Recently Added */}
      <Card className="p-4">
        <h3 className="mb-4 font-semibold text-gray-900">Recently Added</h3>
        <div className="space-y-3">
          {analytics.recentlyAdded.length === 0 ? (
            <p className="text-sm text-gray-500">No recent additions</p>
          ) : (
            analytics.recentlyAdded.map((item, i) => (
              <div key={i} className="border-l-4 border-purple-500 pl-3">
                <p className="text-sm font-medium text-gray-900">{item.title || item.name}</p>
                <p className="text-xs text-gray-500">
                  {new Date(item.created_at).toLocaleDateString()}
                </p>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
