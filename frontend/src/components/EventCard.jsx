import { useState } from "react";
import { toAbsoluteUploadUrl } from "../services/api";
import ImageMedia from "./ImageMedia";
import Card from "./ui/Card";

function getCategory(description) {
  const text = String(description || "").trim();
  if (!text) {
    return "Technical Activity";
  }

  const [prefix] = text.split(" - ");
  return prefix?.trim() || "Technical Activity";
}

function getInitials(title) {
  const words = String(title || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return "TA";
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

function formatEventDate(value) {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }
  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function EventImageFallback({ title, category }) {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.28),transparent_45%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.24),transparent_42%)]" />
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full border border-white/20" />
      <div className="pointer-events-none absolute -bottom-8 -left-8 h-20 w-20 rounded-full border border-white/15" />

      <div className="relative flex flex-col items-center gap-3 px-4 text-center">
        <span className="rounded-full border border-white/30 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-white/90">
          {category}
        </span>
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/30 bg-white/10 text-lg font-semibold">
          {getInitials(title)}
        </span>
        <p className="max-w-[18ch] text-xs font-medium leading-relaxed text-white/85">
          Event image will be updated soon
        </p>
      </div>
    </div>
  );
}

export default function EventCard({ activity }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const title = activity.title?.trim() || "Technical Activity";
  const description = activity.description?.trim() || "Details will be updated soon.";
  const category = getCategory(description);
  const imageSrc = toAbsoluteUploadUrl(activity.image_url);
  const venue = activity.venue?.trim() || "IEI Kanyakumari Local Centre";
  const detailsButtonLabel = activity.details_button_text?.trim() || "View Event Details →";
  const collapseButtonLabel = activity.collapse_button_text?.trim() || "Hide Details ↑";
  const primaryResourceUrl = activity.resource_url || activity.pdf_url || activity.link || "";
  const imageClickUrl = activity.pdf_url?.trim() || primaryResourceUrl;
  const primaryResourceLabel = activity.resource_label?.trim() || activity.button_text?.trim() || "View PDF";
  const secondaryResourceUrl = activity.secondary_resource_url || activity.colab_url || "";
  const secondaryResourceLabel = activity.secondary_resource_label?.trim() || "Colab / Resources";
  const eventDate = formatEventDate(activity.event_date);
  return (
    <Card interactive padded={false} className={"group overflow-hidden"}>
      <div className={"relative aspect-[4/3] w-full overflow-hidden bg-gray-50"}>
        {imageClickUrl ? (
          <a
            href={toAbsoluteUploadUrl(imageClickUrl)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open PDF for ${title}`}
            className="block h-full w-full"
          >
            <ImageMedia
              src={imageSrc}
              alt={title}
              fit="cover"
              position="50% 50%"
              className="h-full w-full cursor-pointer transition-transform duration-300 group-hover:scale-[1.02]"
              fallback={<EventImageFallback title={title} category={category} />}
            />
          </a>
        ) : (
          <ImageMedia
            src={imageSrc}
            alt={title}
            fit="cover"
            position="50% 50%"
            className="h-full w-full transition-transform duration-300 group-hover:scale-[1.02]"
            fallback={<EventImageFallback title={title} category={category} />}
          />
        )}
        {eventDate && (
          <span className="absolute left-3 top-3 rounded-lg bg-white/90 px-2.5 py-1 text-xs font-medium text-gray-700 shadow-sm backdrop-blur" >
            {eventDate}
          </span>
        )}
        <span className="absolute right-3 top-3 rounded-full border border-white/80 bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-gray-600 shadow-sm backdrop-blur">
          {category}
        </span>
      </div>

      <div className="space-y-2 p-5">
         <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-400">Hosted by IEI KKLC</p>
        <h3 className="text-base font-semibold leading-snug text-gray-900">{title}</h3>
        
        <p className={`text-sm leading-relaxed text-gray-500 ${isExpanded ? '' : 'line-clamp-3'}`}>
          {description}
        </p>
        
        <p className="truncate pt-1 text-xs text-gray-400">{venue}</p>

        {isExpanded ? (
          <>
            {(primaryResourceUrl || secondaryResourceUrl) && (
              <div className="mt-4 flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                {primaryResourceUrl && (
                  <a
                    href={toAbsoluteUploadUrl(primaryResourceUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-100"
                  >
                    <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M4 1.5A1.5 1.5 0 0 0 2.5 3v10A1.5 1.5 0 0 0 4 14.5h8a1.5 1.5 0 0 0 1.5-1.5V5.5L9.5 1.5H4zM10 2v3.5a.5.5 0 0 0 .5.5H14L10 2zM5.5 11v-1h5v1h-5zm0-2V8h5v1h-5z"/>
                    </svg>
                    {primaryResourceLabel}
                  </a>
                )}
                {secondaryResourceUrl && (
                  <a
                    href={toAbsoluteUploadUrl(secondaryResourceUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded bg-orange-50 px-2 py-1 text-xs font-medium text-orange-700 transition-colors hover:bg-orange-100"
                  >
                    <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2zm2-1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H4zm3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM8 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3-3a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
                    </svg>
                    {secondaryResourceLabel}
                  </a>
                )}
              </div>
            )}
            <button
              onClick={() => setIsExpanded(false)}
              className="mt-2 block pt-2 text-xs font-semibold uppercase tracking-[0.1em] text-gray-400 transition-colors duration-200 hover:text-gray-900"
            >
              {collapseButtonLabel}
            </button>
          </>
        ) : (
          <button
            onClick={() => setIsExpanded(true)}
            className="block pt-2 text-xs font-semibold uppercase tracking-[0.1em] text-gray-400 transition-colors duration-200 hover:text-gray-900"
          >
            {detailsButtonLabel}
          </button>
        )}
      </div>
    </Card>
  );
}
