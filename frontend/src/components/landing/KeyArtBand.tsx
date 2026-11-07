export function KeyArtBand() {
  return (
    <section className="pb-[var(--section-gap)] pt-[var(--section-gap-s)]">
      <div className="mx-auto w-[min(100%-2rem,74rem)]">
        <div className="l-art h-64 sm:h-80 lg:h-auto lg:aspect-[16/7]">
          <img
            alt=""
            aria-hidden="true"
            draggable={false}
            src="/images/space-hero.png"
          />
        </div>
        <p className="l-readout mt-3">illustration: from the product’s key art</p>
      </div>
    </section>
  );
}
