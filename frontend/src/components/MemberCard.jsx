import { Link } from "react-router-dom";
import { toAbsoluteUploadUrl } from "../services/api";
import ImageMedia from "./ImageMedia";

export default function MemberCard({ member }) {
  const name = member.name?.trim() || "Member";
  const position = member.position?.trim() || "Member";
  const initial = name.charAt(0).toUpperCase();

  return (
    <article className="section-card interactive-card group flex h-full flex-col overflow-hidden rounded-xl shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
      <div className="h-36 w-full overflow-hidden bg-brand-100 sm:h-40 lg:h-44">
        {member.image_url ? (
          <ImageMedia
            src={toAbsoluteUploadUrl(member.image_url)}
            alt={name}
            position="50% 12%"
            className="h-full w-full object-top transition duration-300 group-hover:scale-105"
            fallback={
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-600 to-brand-400 text-2xl font-black text-white">
                {initial}
              </div>
            }
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-600 to-brand-400 text-2xl font-black text-white">
            {initial}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col space-y-2.5 p-4 sm:p-5">
        <p className="inline-flex w-fit items-center rounded-md bg-brand-100 px-2.5 py-1 text-sm font-semibold text-brand-700">
          {position}
        </p>
        <h3 className="text-lg font-semibold leading-tight text-brand-900">{name}</h3>
        <div className="mt-auto pt-1">
          <Link
            to={`/members/${member.id}`}
            className="focus-ring inline-flex items-center rounded-lg border border-brand-200 px-3 py-1.5 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
          >
            View Details
          </Link>
        </div>
      </div>
    </article>
  );
}
