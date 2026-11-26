import React from "react";
import { getSeoSettings } from "@/lib/seo-settings";
import { BRAND_CONTACT } from "@/lib/brand-assets";

export default async function JsonLd() {
  const seo = await getSeoSettings();
  const baseUrl = seo.siteDomain.replace(/\/$/, "");

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": ["Organization", "OnlineStore"],
    name: "SAMORA",
    alternateName: "SAMORA Haute Streetwear Pakistan",
    url: baseUrl,
    logo: `${baseUrl}/assets/logos/logo-1.jpeg`,
    image: `${baseUrl}/assets/logos/logo-2.jpeg`,
    description: seo.metaDescription,
    telephone: BRAND_CONTACT.phone,
    sameAs: [
      BRAND_CONTACT.instagram,
      BRAND_CONTACT.facebook,
    ],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Lahore",
      addressRegion: "Punjab",
      addressCountry: "PK",
    },
    currenciesAccepted: "PKR",
    paymentAccepted: "Cash on Delivery",
    priceRange: "$$",
  };

  const webSiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "SAMORA Store",
    url: baseUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/shop?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
      />
      {seo.googleVerification && (
        <meta name="google-site-verification" content={seo.googleVerification} />
      )}
      {seo.facebookPixelId && (
        <script
          dangerouslySetInnerHTML={{
            __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init', '${seo.facebookPixelId}');fbq('track', 'PageView');`,
          }}
        />
      )}
    </>
  );
}
