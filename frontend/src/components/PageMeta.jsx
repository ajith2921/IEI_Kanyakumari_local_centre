import { Helmet } from "react-helmet-async";

export default function PageMeta({
  title,
  description,
  canonical,
  ogTitle,
  ogDescription,
  ogImage,
  ogType = "website",
}) {
  const siteName = "IEI Kanyakumari Local Centre";
  const fullTitle = title ? `${title} — ${siteName}` : siteName;
  const canonicalUrl = canonical || "https://www.ieikanyakumarilc.org";
  const ogImageUrl = ogImage || "https://www.ieikanyakumarilc.org/home-bg.jpg";

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description || "Official website of The Institution of Engineers (India), Kanyakumari Local Centre"} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:title" content={ogTitle || title || siteName} />
      <meta property="og:description" content={ogDescription || description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImageUrl} />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={ogTitle || title || siteName} />
      <meta name="twitter:description" content={ogDescription || description} />
      <meta name="twitter:image" content={ogImageUrl} />
    </Helmet>
  );
}
