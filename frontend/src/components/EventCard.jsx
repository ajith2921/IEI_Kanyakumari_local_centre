import { toAbsoluteUploadUrl } from "../services/api";
import ImageMedia from "./ImageMedia";
import Card from "./ui/Card";

export default function EventCard({ activity }) {
  const eventDate = activity.event_date
    ? new Date(activity.event_date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <Card interactive padded={false} className="group overflow-hidden">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-50">
        <ImageMedia
          src={toAbsoluteUploadUrl(activity.image_url)}
          alt={activity.title}
          fit="cover"
          position="50% 50%"
          className="h-full w-full transition-transform duration-300 group-hover:scale-[1.02]"
          fallback={
            <div className="flex h-full items-center justify-center bg-gray-50 text-sm text-gray-300">
              Technical Activity
            </div>
          }
        />
        {eventDate && (
          <span className="absolute left-3 top-3 rounded-lg bg-white/90 px-2.5 py-1 text-xs font-medium text-gray-700 shadow-sm backdrop-blur">
            {eventDate}
          </span>
        )}
      </div>
      <div className="space-y-2 p-5">
        <h3 className="text-base font-semibold leading-snug text-gray-900">{activity.title}</h3>
        <p className="line-clamp-3 text-sm leading-relaxed text-gray-500">{activity.description}</p>
      </div>
    </Card>
  );
}
