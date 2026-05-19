import SectionHeader from "../components/SectionHeader";
import GalleryGrid from "../components/GalleryGrid";
import ErrorState from "../components/ErrorState";
import PageMeta from "../components/PageMeta";
import Pagination from "../components/Pagination";
import { SkeletonGrid } from "../components/Skeletons";
import useFetchList from "../hooks/useFetchList";
import { publicApi } from "../services/api";

export default function GalleryPage() {
  const { data, loading, error, reload, page, totalPages, totalCount, goToPage } = useFetchList(publicApi.getGallery);

  return (
    <>
      <PageMeta
        title="Gallery"
        description="Browse our photo gallery featuring moments from IEI Kanyakumari events, technical seminars, conferences, and chapter activities."
        canonical="https://www.ieikanyakumarilc.org/gallery"
        ogTitle="IEI Kanyakumari Event Gallery"
        ogDescription="Photos from engineering events, seminars, and chapter celebrations at IEI Kanyakumari"
      />
      <section className="page-shell section-block">
        <SectionHeader
          eyebrow="Moments"
          title="Gallery"
          titleAs="h1"
          description="Snapshots from technical meetings, seminars, and chapter celebrations."
        />

        {loading && <SkeletonGrid count={6} />}
        {error && <ErrorState message={error} onRetry={reload} />}
        {!loading && !error && <GalleryGrid items={data} />}
        
        {!loading && !error && data.length > 0 && totalPages > 1 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            totalCount={totalCount}
            pageSize={12}
            onPageChange={goToPage}
            loading={loading}
          />
        )}
      </section>
    </>
  );
}
