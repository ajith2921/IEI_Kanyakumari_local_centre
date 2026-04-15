import { useEffect, useState } from "react";
import { toAbsoluteUploadUrl } from "../services/api";
import ImageMedia from "./ImageMedia";

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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActive(item)}
            className="section-card interactive-card group overflow-hidden text-left"
          >
            <div className="aspect-[4/3] w-full overflow-hidden bg-brand-100">
              <ImageMedia
                src={toAbsoluteUploadUrl(item.image_url)}
                alt={item.title}
                position="50% 50%"
                className="h-full w-full transition duration-300 group-hover:scale-105"
                fallback={
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-700 to-brand-500 px-4 text-center text-sm font-bold text-white">
                    Gallery image
                  </div>
                }
              />
            </div>
            <div className="p-4">
              <h3 className="text-base font-black text-brand-800">{item.title}</h3>
              {item.description && <p className="mt-2 text-sm text-slate-600">{item.description}</p>}
            </div>
          </button>
        ))}
      </div>

      {active && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 p-4"
          onClick={() => setActive(null)}
        >
          <div
            className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-white"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActive(null)}
              className="focus-ring absolute right-3 top-3 rounded-lg bg-white/90 px-3 py-1 text-sm font-bold text-brand-700"
            >
              Close
            </button>
            <div className="flex h-[70vh] w-full items-center justify-center bg-slate-50">
              <ImageMedia
                src={toAbsoluteUploadUrl(active.image_url)}
                alt={active.title}
                fit="contain"
                position="50% 50%"
                className="h-full w-full"
                fallback={
                  <div className="flex h-full w-full items-center justify-center px-6 text-center text-sm font-semibold text-slate-500">
                    This image is unavailable.
                  </div>
                }
              />
            </div>
            <div className="p-5">
              <h3 className="text-xl font-black text-brand-800">{active.title}</h3>
              {active.description && <p className="mt-2 text-slate-600">{active.description}</p>}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
