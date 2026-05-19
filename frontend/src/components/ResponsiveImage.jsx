/**
 * ResponsiveImage Component
 * 
 * Renders optimized images with:
 * - Automatic WebP format with fallback
 * - Lazy loading
 * - Responsive sizing
 * - Proper aspect ratio
 */

export function ResponsiveImage({
  src,
  alt,
  srcSet,
  sizes,
  width,
  height,
  className = "",
  loading = "lazy",
  onError,
  webpSrc
}) {
  return (
    <picture>
      {webpSrc && (
        <source
          srcSet={webpSrc}
          type="image/webp"
          sizes={sizes}
        />
      )}
      {srcSet && (
        <source
          srcSet={srcSet}
          sizes={sizes}
        />
      )}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        loading={loading}
        onError={onError}
      />
    </picture>
  );
}

/**
 * Generates srcset string for responsive images
 * @param {string} basePath - Base path without extension
 * @param {number[]} widths - Array of widths (e.g., [320, 640, 1024])
 * @returns {string} - srcset string
 */
export function generateSrcSet(basePath, widths = [320, 640, 1024]) {
  return widths
    .map(width => `${basePath}-${width}w.jpg ${width}w`)
    .join(", ");
}

/**
 * Generates sizes attribute for responsive images
 * @param {string} sizes - CSS media query sizes (e.g., "(max-width: 640px) 100vw, 50vw")
 * @returns {string}
 */
export function generateSizes(sizes) {
  return sizes;
}

export default ResponsiveImage;
