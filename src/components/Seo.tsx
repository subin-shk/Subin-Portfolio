import { useEffect } from "react";
import { seo } from "../data/portfolioData";

export default function Seo() {
  useEffect(() => {
    document.title = seo.title;

    const descriptionTag = document.querySelector('meta[name="description"]');
    if (descriptionTag) {
      descriptionTag.setAttribute("content", seo.description);
    }

    const keywordsTag = document.querySelector('meta[name="keywords"]');
    if (keywordsTag) {
      keywordsTag.setAttribute("content", seo.keywords.join(", "));
    }

    const canonicalTag = document.querySelector('link[rel="canonical"]');
    if (canonicalTag) {
      canonicalTag.setAttribute("href", seo.url);
    }

    const ogTitleTag = document.querySelector('meta[property="og:title"]');
    if (ogTitleTag) {
      ogTitleTag.setAttribute("content", seo.title);
    }

    const ogDescriptionTag = document.querySelector(
      'meta[property="og:description"]'
    );
    if (ogDescriptionTag) {
      ogDescriptionTag.setAttribute("content", seo.description);
    }

    const ogUrlTag = document.querySelector('meta[property="og:url"]');
    if (ogUrlTag) {
      ogUrlTag.setAttribute("content", seo.url);
    }

    const twitterTitleTag = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitleTag) {
      twitterTitleTag.setAttribute("content", seo.title);
    }

    const twitterDescriptionTag = document.querySelector(
      'meta[name="twitter:description"]'
    );
    if (twitterDescriptionTag) {
      twitterDescriptionTag.setAttribute("content", seo.description);
    }

    const existingJsonLd = document.querySelector('script[type="application/ld+json"]');
    if (existingJsonLd) {
      existingJsonLd.remove();
    }

    const schema = {
      "@context": "https://schema.org",
      "@type": ["Person", "WebSite"],
      name: "Subin Shakya",
      url: seo.url,
      jobTitle: "Software QA Engineer",
      description: seo.description,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Kathmandu",
        addressCountry: "Nepal",
      },
      sameAs: [
        "https://www.linkedin.com/in/subinshk",
        "https://github.com/subin-shk",
      ],
      hasOccupation: {
        "@type": "Occupation",
        name: "Software QA Engineer",
        occupationLocation: {
          "@type": "City",
          name: "Kathmandu",
        },
      },
      mainEntityOfPage: seo.url,
      publisher: {
        "@type": "Organization",
        name: "Subin Shakya",
        url: seo.url,
      },
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, []);

  return null;
}
