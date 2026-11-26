import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/components/CartContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import SearchModal from "@/components/SearchModal";
import BrandPreloader from "@/components/BrandPreloader";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import TopProgressBar from "@/components/TopProgressBar";
import PageTransition from "@/components/PageTransition";
import JsonLd from "@/components/JsonLd";
import { getSeoSettings } from "@/lib/seo-settings";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoSettings();
  const baseUrl = seo.siteDomain.replace(/\/$/, "");

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: seo.metaTitle,
      template: "%s | SAMORA",
    },
    description: seo.metaDescription,
    keywords: seo.focusKeywords.split(",").map((k) => k.trim()),
    alternates: {
      canonical: baseUrl,
    },
    openGraph: {
      title: seo.metaTitle,
      description: seo.metaDescription,
      url: baseUrl,
      siteName: "SAMORA",
      images: [
        {
          url: seo.ogImageUrl.startsWith("http") ? seo.ogImageUrl : `${baseUrl}${seo.ogImageUrl}`,
          width: 1200,
          height: 630,
          alt: "SAMORA Haute Streetwear Pakistan",
        },
      ],
      locale: "en_PK",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: seo.metaTitle,
      description: seo.metaDescription,
      images: [seo.ogImageUrl.startsWith("http") ? seo.ogImageUrl : `${baseUrl}${seo.ogImageUrl}`],
    },
    icons: {
      icon: "/assets/logos/logo-4.jpeg",
      shortcut: "/assets/logos/logo-4.jpeg",
      apple: "/assets/logos/logo-4.jpeg",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/jpeg" href="/assets/logos/logo-4.jpeg" />
        <link rel="apple-touch-icon" href="/assets/logos/logo-4.jpeg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;0,9..144,800;1,9..144,400;1,9..144,600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <JsonLd />
      </head>
      <body className="bg-[#F5F1EA] text-[#1F1A17] min-h-screen flex flex-col antialiased selection:bg-[#2C3A2F] selection:text-[#FAF8F4]">
        <TopProgressBar />
        <BrandPreloader />
        <CartProvider>
          <Header />
          <PageTransition>
            <main className="flex-1 w-full">{children}</main>
          </PageTransition>
          <Footer />
          <CartDrawer />
          <SearchModal />
          <FloatingWhatsApp />
        </CartProvider>
      </body>
    </html>
  );
}
