import SectionHeader from "../components/SectionHeader";
import GalleryGrid from "../components/GalleryGrid";
import ErrorState from "../components/ErrorState";
import { SkeletonGrid } from "../components/Skeletons";
import useFetchList from "../hooks/useFetchList";
import { publicApi } from "../services/api";

export default function GalleryPage() {
  const { data, loading, error, reload } = useFetchList(publicApi.getGallery);

  return (
    <section className="page-shell section-block">
      <SectionHeader
        eyebrow="Moments"
        title="Gallery"
        description="Snapshots from technical meetings, seminars, and chapter celebrations."
      />

      {loading && <SkeletonGrid count={6} />}
      {error && <ErrorState message={error} onRetry={reload} />}
      {!loading && !error && <GalleryGrid items={data} />}
    </section>
  );
}
