import { Link } from "react-router-dom";
import { toAbsoluteUploadUrl } from "../services/api";
import ImageMedia from "./ImageMedia";
import Button from "./ui/Button";
import Card from "./ui/Card";

export default function MemberCard({ member }) {
  const name = member.name?.trim() || "Member";
  const position = member.position?.trim() || "Member";
  const initial = name.charAt(0).toUpperCase();

  return (
    <Card interactive padded={false} className="group flex h-full flex-col overflow-hidden">
      <div className="p-4 pb-0 md:p-5 md:pb-0">
        <div className="aspect-square w-full overflow-hidden rounded-xl bg-slate-100">
          <ImageMedia
            src={toAbsoluteUploadUrl(member.image_url)}
            alt={name}
            fit="cover"
            position="50% 50%"
            className="h-full w-full transition-all duration-300 group-hover:scale-105"
            fallback={
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-600 to-blue-500 text-3xl font-semibold text-white">
                {initial || "M"}
              </div>
            }
          />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4 md:p-5">
        <h3 className="text-xl font-semibold leading-tight text-gray-900">{name}</h3>
        <p className="text-sm text-gray-600">{position}</p>
        <div className="mt-auto pt-3">
          <Button as={Link} to={`/members/${member.id}`} variant="secondary" className="w-full sm:w-auto">
            View Details
          </Button>
        </div>
      </div>
    </Card>
  );
}
