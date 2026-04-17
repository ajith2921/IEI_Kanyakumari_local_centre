import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ErrorState from "../components/ErrorState";
import ImageMedia from "../components/ImageMedia";
import LoadingSpinner from "../components/LoadingSpinner";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { parseApiError, publicApi, toAbsoluteUploadUrl } from "../services/api";

function DetailItem({ label, value, fullWidth = false }) {
  return (
    <div className={fullWidth ? "sm:col-span-2" : ""}>
      <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">{label}</dt>
      <dd className="mt-1 whitespace-pre-wrap text-sm text-gray-700">{value || "Not provided"}</dd>
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
        <Button
          as={Link}
          to="/members"
          variant="secondary"
        >
          Back to Members
        </Button>
        <ErrorState message={error} onRetry={loadMember} />
      </section>
    );
  }

  if (!member) {
    return (
      <section className="page-shell section-block space-y-4">
        <Button
          as={Link}
          to="/members"
          variant="secondary"
        >
          Back to Members
        </Button>
        <ErrorState message="Member not found." />
      </section>
    );
  }

  const name = member.name?.trim() || "Member";
  const position = member.position?.trim() || "Member";

  return (
    <section className="page-shell section-block">
      <div className="mb-4">
        <Button
          as={Link}
          to="/members"
          variant="secondary"
        >
          Back to Members
        </Button>
      </div>

      <Card padded={false} className="overflow-hidden">
        <div className="grid gap-0 md:grid-cols-[280px,1fr]">
          <div className="bg-brand-50 p-4 md:p-5">
            <div className="aspect-square h-full w-full overflow-hidden rounded-xl">
              <ImageMedia
                src={toAbsoluteUploadUrl(member.image_url)}
                alt={name}
                fit="cover"
                position="50% 50%"
                className="h-full w-full"
                fallback={
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-600 to-blue-500 text-4xl font-semibold text-white">
                    {name.charAt(0).toUpperCase()}
                  </div>
                }
              />
            </div>
          </div>

          <div className="p-5 md:p-6">
            <p className="inline-flex rounded-full bg-brand-100 px-3 py-1 text-xs font-medium text-brand-700">
              {position}
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-gray-900">{name}</h1>

            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              <DetailItem label="Membership ID" value={member.membership_id} />
              <DetailItem label="Email" value={member.email} />
              <DetailItem label="Mobile" value={member.mobile} />
              <DetailItem label="Address" value={member.address} fullWidth />
            </dl>
          </div>
        </div>
      </Card>
    </section>
  );
}
