import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Hero } from "@/components/Hero";
import { ProductCard } from "@/components/ProductCard";
import { fetchProducts, toProduct } from "@/lib/catalog";
import { useLanguage } from "@/context/LanguageContext";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "تين ليوا — تين وتمور وفواكه فاخرة بالتوصيل" },
      { name: "description", content: "تين أحمر وأصفر طازج، تمور فاخرة، توت وصبار وفقع ولوز. القص والتوصيل في نفس اليوم داخل الإمارات." },
    ],
  }),
  component: Index,
});

function Index() {
  const { t } = useLanguage();
  const [active, setActive] = useState<string>("الكل");
  
  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  const categories = useMemo(() => {
    const seen = new Set<string>();
    rows.forEach((r) => r.category && seen.add(r.category));
    return [...seen];
  }, [rows]);
  
  const filters = ["الكل", ...categories];
  
  const visible = useMemo(
    () => (active === "الكل" ? rows : rows.filter((p) => p.category === active)),
    [active, rows],
  );

  return (
    <main className="min-h-screen pb-16">
      <Hero />
      <div className="mx-auto max-w-6xl px-4">
        <div className="sticky top-16 z-30 -mx-4 flex gap-2 overflow-x-auto border-b border-border/60 bg-background/90 px-4 py-3 backdrop-blur-lg">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActive(f)}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                active === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {f === "الكل" ? t("filter.all") : f}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="mt-10 text-center text-sm text-muted-foreground">جارٍ تحميل المنتجات…</div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {visible.map((p) => (
              <ProductCard key={p.id} product={toProduct(p)} />
            ))}
          </div>
        )}

        <section id="about" className="mt-16 rounded-2xl border border-border/60 bg-card p-6 text-center">
          <h2 className="text-xl font-bold">{t("about.title")}</h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground">
            {t("about.text")}
          </p>
        </section>
      </div>
    </main>
  );
}
