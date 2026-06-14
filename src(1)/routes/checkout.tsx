import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { CURRENCY } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { createOrder } from "@/lib/orders";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "تسجيل الطلب — تين ليوا" },
      { name: "description", content: "أكمل بيانات التوصيل لتسجيل طلبك من تين ليوا." },
    ],
  }),
  component: Checkout,
});

function Checkout() {
  const { items, total, clear } = useCart();
  const navigate = useNavigate();
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tracking, setTracking] = useState("");
  const [form, setForm] = useState({ name: "", phone: "", address: "" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const order = await createOrder({ ...form, items, total });
      setTracking(order.tracking);
      setDone(true);
      clear();
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 text-center">
        <CheckCircle2 className="h-16 w-16 text-primary" />
        <h1 className="mt-4 text-2xl font-extrabold">تم تسجيل طلبك بنجاح!</h1>
        <p className="mt-2 text-sm text-muted-foreground">سنتواصل معك قريباً لتأكيد التوصيل. شكراً لثقتك بـ تين ليوا.</p>
        <div className="mt-6 w-full rounded-2xl border border-border/60 bg-card p-4">
          <span className="text-sm text-muted-foreground">رقم التتبع الخاص بك</span>
          <div className="mt-1 text-xl font-extrabold tracking-wider text-primary">{tracking}</div>
        </div>
        <div className="mt-6 flex w-full flex-col gap-2 sm:flex-row">
          <Link to="/track" search={{ code: tracking }} className="flex-1 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90">
            تتبع الطلب
          </Link>
          <Link to="/" className="flex-1 rounded-xl border border-border px-6 py-3 text-sm font-bold hover:bg-secondary">
            العودة للمتجر
          </Link>
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 text-center">
        <h1 className="text-xl font-bold">سلة التسوق فارغة</h1>
        <button onClick={() => navigate({ to: "/" })} className="mt-4 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90">
          تصفح المنتجات
        </button>
      </main>
    );
  }

  const field = "w-full rounded-xl border border-border bg-secondary px-4 py-3 text-sm outline-none focus:border-primary";

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-extrabold">تسجيل الطلب</h1>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <form onSubmit={submit} className="space-y-3">
          <input required placeholder="الاسم الكامل" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={field} />
          <input required type="tel" placeholder="رقم الهاتف" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={field} />
          <textarea required placeholder="عنوان التوصيل" rows={3} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className={field} />
          <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground transition-opacity hover:bg-primary/90 disabled:opacity-60">
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> جارٍ تسجيل الطلب…</> : <>تأكيد الطلب — {total.toFixed(2)} {CURRENCY}</>}
          </button>
        </form>

        <div className="h-fit rounded-2xl border border-border/60 bg-card p-4">
          <h2 className="mb-3 font-bold">ملخص الطلب</h2>
          <div className="space-y-2">
            {items.map((i) => (
              <div key={i.product.id} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{i.product.name} × {i.qty}</span>
                <span className="font-semibold">{i.product.price * i.qty} {CURRENCY}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex justify-between border-t border-border/60 pt-3 font-bold">
            <span>الإجمالي</span>
            <span className="text-primary">{total.toFixed(2)} {CURRENCY}</span>
          </div>
        </div>
      </div>
    </main>
  );
}