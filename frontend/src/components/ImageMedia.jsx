import { memo, useEffect, useState } from "react";

const fitClassMap = {
  cover: "object-cover",
  contain: "object-contain",
};

function ImageMedia({
  src,
  alt,
  fit = "cover",
  position = "50% 50%",
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
    return fallback;
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
      className={`block ${fitClassMap[fit] || fitClassMap.cover} ${
        showSkeleton && !isLoaded ? "animate-pulse bg-slate-200" : ""
      } ${className}`.trim()}
    />
  );
}

export default memo(ImageMedia);