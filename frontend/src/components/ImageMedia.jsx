import { memo, useEffect, useState } from "react";

const fitClassMap = {
  cover: "object-cover",
  contain: "object-contain",
};

function DefaultFallback({ altText = "Image" }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-500">
      <div className="flex flex-col items-center gap-2 px-4 text-center">
        <div className="rounded-xl bg-white/80 p-2 shadow-sm">
          <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
            <path
              d="M5 7.5A2.5 2.5 0 0 1 7.5 5h9A2.5 2.5 0 0 1 19 7.5v9a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 5 16.5v-9Z"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M8.5 14.5 10.5 12l2 2 3-3"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="9" cy="9" r="1" fill="currentColor" />
          </svg>
        </div>
        <p className="text-xs font-medium">{altText}</p>
      </div>
    </div>
  );
}

function ImageMedia({
  src,
  alt,
  fit = "cover",
  position = "50% 50%",
  aspectClass = "",
  className = "",
  loading = "lazy",
  fallback = null,
  showSkeleton = true,
}) {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setHasError(false);
    setIsLoaded(false);
  }, [src]);

  if (!src || hasError) {
    return fallback || <DefaultFallback altText={alt || "Image unavailable"} />;
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      decoding="async"
      onLoad={() => setIsLoaded(true)}
      onError={() => setHasError(true)}
      style={{ objectPosition: position }}
      className={`block object-center ${fitClassMap[fit] || fitClassMap.cover} ${aspectClass} ${
        showSkeleton && !isLoaded ? "animate-pulse bg-slate-200" : ""
      } ${className}`.trim()}
    />
  );
}

export default memo(ImageMedia);