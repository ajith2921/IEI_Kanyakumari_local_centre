import { Link } from "react-router-dom";
import { toAbsoluteUploadUrl } from "../services/api";
import ImageMedia from "./ImageMedia";
import Card from "./ui/Card";

export default function MemberCard({ member }) {
  const name = member.name?.trim() || "Member";
  const position = member.position?.trim() || "Member";
  const membershipId = member.membership_id ? String(member.membership_id).trim() : "";
  const email = member.email?.trim() || "";
  const phone = member.mobile?.trim() || member.phone?.trim() || "";

  return (
    <Link to="/members" className="focus-ring block h-full rounded-2xl">
      <Card interactive padded={false} className="group flex h-full flex-col overflow-hidden">
        <div className="relative p-5 pb-0">
          <span className="absolute left-8 top-8 z-10 rounded-full border border-white/80 bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-gray-600 shadow-sm">
            IEI Member
          </span>
          <div className="aspect-square w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
            <ImageMedia
              src={toAbsoluteUploadUrl(member.image_url)}
              alt={name}
              fit="cover"
              position="50% 50%"
              className="h-full w-full transition-transform duration-300 group-hover:scale-[1.02]"
              fallback={
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-200 via-slate-100 to-white text-slate-500">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-12 w-12"
                    role="img"
                    aria-label={`${name} profile placeholder`}
                  >
                    <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.7" />
                    <path
                      d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              }
            />
          </div>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <h3 className="text-base font-semibold leading-tight text-gray-900">{name}</h3>
          <p className="mt-1 text-sm font-medium text-gray-500">{position}</p>

          <div className="mt-3 flex flex-wrap gap-2">
            {membershipId && (
              <span className="rounded-full border border-cyan-100 bg-cyan-50 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-cyan-700">
                M.No. {membershipId}
              </span>
            )}
            {phone && (
              <span className="rounded-full border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-medium text-gray-500">
                {phone}
              </span>
            )}
          </div>

          {email && (
            <p className="mt-3 truncate text-xs text-gray-400">{email}</p>
          )}

          <p className="mt-auto pt-4 text-xs font-semibold uppercase tracking-[0.1em] text-gray-400 transition-colors duration-200 group-hover:text-gray-900">
            View Profile Directory →
          </p>
        </div>
      </Card>
    </Link>
  );
}
