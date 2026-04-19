import { Link } from "react-router-dom";
import { toAbsoluteUploadUrl } from "../services/api";
import ImageMedia from "./ImageMedia";
import Card from "./ui/Card";

export default function MemberCard({ member }) {
  const name = member.name?.trim() || "Member";
  const position = member.position?.trim() || "Member";
  const initial = name.charAt(0).toUpperCase();

  return (
    <Link to="/members" className="focus-ring block h-full rounded-2xl">
      <Card interactive padded={false} className="group flex h-full flex-col overflow-hidden">
        <div className="p-5 pb-0">
          <div className="aspect-square w-full overflow-hidden rounded-xl bg-gray-50">
            <ImageMedia
              src={toAbsoluteUploadUrl(member.image_url)}
              alt={name}
              fit="cover"
              position="50% 50%"
              className="h-full w-full transition-transform duration-300 group-hover:scale-[1.02]"
              fallback={
                <div className="flex h-full w-full items-center justify-center bg-gray-50 text-3xl font-semibold text-gray-300">
                  {initial || "M"}
                </div>
              }
            />
          </div>
        </div>
        <div className="flex flex-1 flex-col p-5">
          <h3 className="text-base font-semibold leading-tight text-gray-900">{name}</h3>
          <p className="mt-1 text-sm text-gray-400">{position}</p>
          <p className="mt-auto pt-4 text-xs font-medium text-gray-400 transition-colors duration-200 group-hover:text-gray-900">
            View Committee →
          </p>
        </div>
      </Card>
    </Link>
  );
}
