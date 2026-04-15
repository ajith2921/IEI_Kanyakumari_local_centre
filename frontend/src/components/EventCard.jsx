import { toAbsoluteUploadUrl } from "../services/api";
import ImageMedia from "./ImageMedia";

export default function EventCard({ activity }) {
  return (
    <article className="section-card interactive-card overflow-hidden">
      <div className="group aspect-[4/3] w-full overflow-hidden bg-brand-100">
        {activity.image_url ? (
          <ImageMedia
            src={toAbsoluteUploadUrl(activity.image_url)}
            alt={activity.title}
            position="50% 50%"
            className="h-full w-full transition duration-300 group-hover:scale-105"
            fallback={
              <div className="flex h-full items-center justify-center bg-gradient-to-r from-brand-700 to-brand-500 text-sm font-bold uppercase tracking-wider text-white">
                Technical Activity
              </div>
            }
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-r from-brand-700 to-brand-500 text-sm font-bold uppercase tracking-wider text-white">
            Technical Activity
          </div>
        )}
      </div>
      <div className="space-y-2 p-5">
        <p className="mb-2 inline-flex rounded-full bg-brand-100 px-3 py-1 text-xs font-bold text-brand-700">
          {activity.event_date || "Upcoming"}
        </p>
        <h3 className="heading-h3 font-black text-brand-800">{activity.title}</h3>
        <p className="line-clamp-4 text-sm leading-relaxed text-slate-600">{activity.description}</p>
      </div>
    </article>
  );
}
