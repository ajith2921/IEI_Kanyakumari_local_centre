import { toAbsoluteUploadUrl } from "../services/api";
import ImageMedia from "./ImageMedia";
import Card from "./ui/Card";

export default function EventCard({ activity }) {
  return (
    <Card interactive padded={false} className="group overflow-hidden">
      <div className="aspect-[4/3] w-full overflow-hidden bg-brand-50">
        <ImageMedia
          src={toAbsoluteUploadUrl(activity.image_url)}
          alt={activity.title}
          fit="cover"
          position="50% 50%"
          className="h-full w-full transition-all duration-300 group-hover:scale-105"
          fallback={
            <div className="flex h-full items-center justify-center bg-gradient-to-r from-brand-700 to-blue-500 text-sm font-semibold uppercase tracking-wider text-white">
              Technical Activity
            </div>
          }
        />
      </div>
      <div className="space-y-2 p-5">
        <p className="mb-2 inline-flex rounded-full bg-brand-100 px-3 py-1 text-xs font-medium text-brand-700">
          {activity.event_date || "Upcoming"}
        </p>
        <h3 className="heading-h3 font-semibold text-gray-900">{activity.title}</h3>
        <p className="line-clamp-4 text-sm leading-relaxed text-gray-600">{activity.description}</p>
      </div>
    </Card>
  );
}
