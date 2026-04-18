import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ErrorState from "../components/ErrorState";
import ImageMedia from "../components/ImageMedia";
import LoadingSpinner from "../components/LoadingSpinner";
import Button from "../components/ui/Button";
import { parseApiError, publicApi, toAbsoluteUploadUrl } from "../services/api";

function DetailItem({ label, value, fullWidth = false }) {
  return (
    <div className={fullWidth ? "sm:col-span-2" : ""}>
      <dt className="eyebrow-chip mb-1">{label}</dt>
      <dd className="whitespace-pre-wrap text-sm text-gray-600">{value || "Not provided"}</dd>
    </div>
  );
}

export default function MemberDetails() {
  const { id } = useParams();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadMember = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await publicApi.getMemberById(id);
      setMember(response.data || null);
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMember();
  }, [id]);

  if (loading) {
    return (
      <section className="page-shell section-block">
        <LoadingSpinner text="Loading member details..." />
      </section>
    );
  }

  if (error) {
    return (
      <section className="page-shell section-block space-y-4">
        <Button as={Link} to="/members" variant="secondary" size="sm">← Back to Members</Button>
        <ErrorState message={error} onRetry={loadMember} />
      </section>
    );
  }

  if (!member) {
    return (
      <section className="page-shell section-block space-y-4">
        <Button as={Link} to="/members" variant="secondary" size="sm">← Back to Members</Button>
        <ErrorState message="Member not found." />
      </section>
    );
  }

  const name = member.name?.trim() || "Member";
  const position = member.position?.trim() || "Member";

  return (
    <section className="page-shell section-block">
      <div className="mb-8">
        <Button as={Link} to="/members" variant="secondary" size="sm">← Back to Members</Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="grid gap-0 md:grid-cols-[280px,1fr]">
          {/* Photo */}
          <div className="bg-gray-50/60 p-6">
            <div className="aspect-square w-full overflow-hidden rounded-xl bg-gray-100">
              <ImageMedia
                src={toAbsoluteUploadUrl(member.image_url)}
                alt={name}
                fit="cover"
                position="50% 50%"
                className="h-full w-full"
                fallback={
                  <div className="flex h-full w-full items-center justify-center bg-gray-50 text-4xl font-semibold text-gray-300">
                    {name.charAt(0).toUpperCase()}
                  </div>
                }
              />
            </div>
          </div>

          {/* Details */}
          <div className="p-6 md:p-8">
            <p className="eyebrow-chip mb-2">{position}</p>
            <h1 className="heading-h2 text-gray-900">{name}</h1>

            <dl className="mt-8 grid gap-6 sm:grid-cols-2">
              <DetailItem label="Membership ID" value={member.membership_id} />
              <DetailItem label="Email"         value={member.email} />
              <DetailItem label="Mobile"        value={member.mobile} />
              <DetailItem label="Address"       value={member.address} fullWidth />
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
