import { useEffect, useState } from "react";
import { toAbsoluteUploadUrl } from "../services/api";
import EmptyState from "./EmptyState";
import ImageMedia from "./ImageMedia";
import Card from "./ui/Card";

export default function GalleryGrid({ items }) {
  const [active, setActive] = useState(null);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setActive(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      {items.length === 0 ? (
        <EmptyState
          title="No gallery items yet"
          description="Published photos will appear in this gallery once available."
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {items.map((item) => (
            <Card
              key={item.id}
              as="button"
              onClick={() => setActive(item)}
              interactive
              padded={false}
              className="group overflow-hidden text-left"
            >
              <div className="aspect-[4/3] w-full overflow-hidden bg-gray-50">
                <ImageMedia
                  src={toAbsoluteUploadUrl(item.image_url)}
                  alt={item.title}
                  position="50% 50%"
                  className="h-full w-full transition-transform duration-300 group-hover:scale-[1.02]"
                  fallback={
                    <div className="flex h-full w-full items-center justify-center bg-gray-50 text-sm text-gray-300">
                      Gallery image
                    </div>
                  }
                />
              </div>
              <div className="p-4">
                <h3 className="text-sm font-semibold text-gray-900">{item.title}</h3>
                {item.description && <p className="mt-1.5 text-sm text-gray-500">{item.description}</p>}
              </div>
            </Card>
          ))}
        </div>
      )}

      {active && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in"
          onClick={() => setActive(null)}
        >
          <div
            className="relative w-full max-w-5xl overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActive(null)}
              className="focus-ring absolute right-3 top-3 z-10 rounded-lg border border-gray-200 bg-white/90 px-3 py-1.5 text-xs font-medium text-gray-600 backdrop-blur transition-colors duration-200 hover:bg-gray-50"
            >
              Close
            </button>
            <div className="flex h-[70vh] w-full items-center justify-center bg-gray-50">
              <ImageMedia
                src={toAbsoluteUploadUrl(active.image_url)}
                alt={active.title}
                fit="contain"
                position="50% 50%"
                className="h-full w-full"
                fallback={
                  <div className="flex h-full w-full items-center justify-center px-6 text-center text-sm text-gray-400">
                    This image is unavailable.
                  </div>
                }
              />
            </div>
            <div className="p-5">
              <h3 className="text-base font-semibold text-gray-900">{active.title}</h3>
              {active.description && <p className="mt-1.5 text-sm text-gray-500">{active.description}</p>}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
