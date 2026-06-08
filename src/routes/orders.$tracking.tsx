import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, Circle, FileText, XCircle } from "lucide-react";
import { CURRENCY } from "@/data/products";
import { canCancel, cancelOrder, findOrder, formatDateTime, getTimeline, isCancelled, type Order } from "@/lib/orders";

export const Route = createFileRoute("/orders/$tracking")({
  head: () => ({
    meta: [
      { title: "تفاصيل الطلب — تين ليوا" },
      { name: "description", content: "تفاصيل الطلب والعناصر وحالة كل خطوة." },
    ],
  }),
  component: OrderDetail,
});

function OrderDetail() {
  const { tracking } = useParams({ from: "/orders/$tracking" });
  const [order, setOrder] = useState<Order | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    findOrder(tracking).then((o) => {
      setOrder(o);
      setLoaded(true);
    });
  }, [tracking]);

  const handleCancel = async () => {
    if (!order) return;
    if (!confirm("هل أنت متأكد من إلغاء هذا الطلب؟")) return;
    const updated = await cancelOrder(order.tracking);
    if (updated) setOrder(updated);
  };

  if (loaded && !order) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
        <FileText className="h-12 w-12 text-muted-foreground/50" />
        <h1 className="mt-4 text-xl font-bold">لم نجد هذا الطلب</h1>
        <Link to="/orders" className="mt-4 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90">
          العودة لطلباتي
        </Link>
      </main>
    );
  }

  if (!order) return null;

  const cancelled = isCancelled(order.status);

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <Link to="/orders" className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ArrowRight className="h-4 w-4" /> طلباتي
      </Link>
      <h1 className="mt-3 text-2xl font-extrabold">تفاصيل الطلب</h1>
      <div className="mt-1 font-bold text-primary">{order.tracking}</div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border/60 bg-card p-5">
          <h2 className="mb-3 font-bold">بيانات المستلم</h2>
          <div className="space-y-1 text-sm">
            <div><span className="text-muted-foreground">الاسم: </span><span className="font-semibold">{order.name}</span></div>
            <div><span className="text-muted-foreground">الهاتف: </span><span className="font-semibold">{order.phone}</span></div>
            <div><span className="text-muted-foreground">العنوان: </span><span className="font-semibold">{order.address}</span></div>
            <div><span className="text-muted-foreground">تاريخ الطلب: </span><span className="font-semibold">{formatDateTime(order.createdAt)}</span></div>
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-5">
          <h2 className="mb-3 font-bold">{cancelled ? "حالة الاسترجاع" : "حالة الطلب"}</h2>
          <ol className="space-y-3">
            {getTimeline(order).map((step, idx) => (
              <li key={idx} className="flex items-start gap-3">
                {step.reached ? (
                  <CheckCircle2 className={`h-5 w-5 shrink-0 ${cancelled ? "text-destructive" : "text-primary"}`} />
                ) : (
                  <Circle className="h-5 w-5 shrink-0 text-muted-foreground/40" />
                )}
                <div>
                  <span className={`text-sm ${step.reached ? "font-semibold" : "text-muted-foreground"}`}>{step.label}</span>
                  {step.at && <div className="text-xs text-muted-foreground">{formatDateTime(step.at)}</div>}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-border/60 bg-card p-5">
        <h2 className="mb-3 font-bold">العناصر</h2>
        <div className="space-y-2">
          {order.items.map((i) => (
            <div key={i.id} className="flex justify-between text-sm">
              <span className="text-muted-foreground">{i.name} × {i.qty}</span>
              <span className="font-semibold">{i.price * i.qty} {CURRENCY}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex justify-between border-t border-border/60 pt-3 font-bold">
          <span>الإجمالي</span>
          <span className="text-primary">{order.total.toFixed(2)} {CURRENCY}</span>
        </div>
      </div>

      {canCancel(order.status) && (
        <button
          onClick={handleCancel}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-destructive/40 px-5 py-3 text-sm font-bold text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground"
        >
          <XCircle className="h-4 w-4" /> إلغاء الطلب واسترجاع المبلغ
        </button>
      )}
    </main>
  );
}