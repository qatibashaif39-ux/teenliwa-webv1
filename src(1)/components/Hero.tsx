import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";

import figsImg from "@/assets/hero-figs.jpg";
import datesImg from "@/assets/dates.jpg";
import almondsImg from "@/assets/almonds.jpg";
import yellowFigImg from "@/assets/yellow-fig.jpg";

export function Hero() {
  const { t, dir } = useLanguage();
  const [emblaRef] = useEmblaCarousel({ loop: true, direction: dir }, [
    Autoplay({ delay: 5000, stopOnInteraction: false }),
  ]);

  const slides = [
    { image: figsImg, title: t("hero.title"), delivery: t("hero.delivery"), subtitle: t("hero.subtitle") },
    { image: datesImg, title: t("hero.title"), delivery: t("hero.delivery"), subtitle: t("hero.subtitle") },
    { image: almondsImg, title: t("hero.title"), delivery: t("hero.delivery"), subtitle: t("hero.subtitle") },
    { image: yellowFigImg, title: t("hero.title"), delivery: t("hero.delivery"), subtitle: t("hero.subtitle") },
  ];

  return (
    <section className="relative overflow-hidden" ref={emblaRef}>
      <div className="flex">
        {slides.map((slide, index) => (
          <div key={index} className="relative min-w-0 flex-[0_0_100%]">
            <img
              src={slide.image}
              alt={slide.title}
              className="h-[42vh] min-h-[300px] w-full object-cover sm:h-[50vh]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
            <div className="absolute inset-0 flex items-end">
              <div className="mx-auto w-full max-w-6xl px-4 pb-12">
                <h1 className="max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-1000 text-3xl font-extrabold leading-tight text-foreground sm:text-4xl md:text-5xl">
                  {slide.title}
                  <span className="text-primary">{slide.delivery}</span>
                </h1>
                <p className="mt-3 max-w-md animate-in fade-in slide-in-from-bottom-4 delay-200 duration-1000 text-sm text-muted-foreground sm:text-base md:text-lg">
                  {slide.subtitle}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}