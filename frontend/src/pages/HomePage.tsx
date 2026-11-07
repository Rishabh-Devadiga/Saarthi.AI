import { CTASection } from "@/components/landing/CTASection";
import { FAQ } from "@/components/landing/FAQ";
import { FeatureGrid } from "@/components/landing/FeatureGrid";
import { Footer } from "@/components/landing/Footer";
import { Hero } from "@/components/landing/Hero";
import { KeyArtBand } from "@/components/landing/KeyArtBand";
import { Navbar } from "@/components/landing/Navbar";
import { ProductSection } from "@/components/landing/ProductSection";

export function HomePage() {
  return (
    <div className="lumen">
      <Navbar />
      <main>
        <Hero />
        <ProductSection />
        <FeatureGrid />
        <KeyArtBand />
        <FAQ />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
