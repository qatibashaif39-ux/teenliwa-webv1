import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { CURRENCY } from "@/data/products";
import {
  fetchDeliveryZones,
  createDeliveryZone,
  updateDeliveryZone,
  deleteDeliveryZone,
  type DeliveryZone,
  type DeliveryZoneInput,
} from "@/lib/catalog";

export const Route = createFileRoute("/dashboard/delivery")({
  component: DashboardDelivery,
});

const empty: DeliveryZoneInput = { name: "", fee: 0, active: true, sort_order: 0 };

function DashboardDelivery() {
  const qc = useQueryClient();
  const { data: zones = [], isLoading } = useQuery({
    queryKey: ["delivery_zones"],
    queryFn: () => fetchDeliveryZones(false),
  });
  const [editing, setEditing] = useState<DeliveryZone | null>(null);
  const [creating, setCreating] = useState(false);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["delivery_zones"] });

  const removeMut = useMutation({
    mutationFn: deleteDeliveryZone,
    onSuccess: () => {
      toast.success("تم حذف المنطقة");
      invalidate();
    },
    onError: (e: any) => toast.error(e?.message ?? "تعذّر الحذف"),
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">مناطق التوصيل</h1>
        <button
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> منطقة جديدة
        </button>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">حدّد المناطق التي تصل إليها ورسوم التوصيل لكل منطقة.</p>

      {isLoading ? (
        <div className="mt-8 text-center text-sm text-muted-foreground">جارٍ التحميل…</div>
      ) : zones.length === 0 ? (
        <div className="mt-8 text-center text-sm text-muted-foreground">لا توجد مناطق بعد. أضف أول منطقة توصيل.</div>
      ) : (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {zones.map((z) => (
            <div key={z.id} className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-3">
              <div className="min-w-0 flex-1">
                <div className="truncate font-bold">{z.name}</div>
                <div className="mt-1 text-sm font-semibold text-primary">
                  {z.fee === 0 ? "توصيل مجاني" : `${z.fee} ${CURRENCY}`}
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                    z.active ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {z.active ? "مفعّلة" : "موقوفة"}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setEditing(z)}
                    className="rounded-lg border border-border p-1.5 text-muted-foreground hover:text-foreground"
                    aria-label="تعديل"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`حذف منطقة "${z.name}"؟`)) removeMut.mutate(z.id);
                    }}
                    className="rounded-lg border border-destructive/40 p-1.5 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    aria-label="حذف"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {(creating || editing) && (
        <ZoneForm
          zone={editing}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSaved={() => {
            invalidate();
            setCreating(false);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function ZoneForm({
  zone,
  onClose,
  onSaved,
}: {
  zone: DeliveryZone | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<DeliveryZoneInput>(
    zone
      ? { name: zone.name, fee: zone.fee, active: zone.active, sort_order: zone.sort_order }
      : empty,
  );

  const mut = useMutation({
    mutationFn: async () => {
      if (zone) await updateDeliveryZone(zone.id, form);
      else await createDeliveryZone(form);
    },
    onSuccess: () => {
      toast.success(zone ? "تم تحديث المنطقة" : "تمت إضافة المنطقة");
      onSaved();
    },
    onError: (e: any) => toast.error(e?.message ?? "تعذّر الحفظ"),
  });

  const field = "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl border border-border bg-card p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">{zone ? "تعديل منطقة" : "منطقة جديدة"}</h2>
          <button onClick={onClose} aria-label="إغلاق" className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            mut.mutate();
          }}
          className="mt-4 space-y-3"
        >
          <input
            className={field}
            placeholder="اسم المنطقة (مثل: أبوظبي)"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <div className="flex gap-3">
            <input
              className={field}
              type="number"
              min={0}
              step="0.01"
              placeholder="رسوم التوصيل"
              required
              value={form.fee}
              onChange={(e) => setForm({ ...form, fee: Number(e.target.value) })}
            />
            <input
              className={field}
              type="number"
              placeholder="الترتيب"
              value={form.sort_order}
              onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
            />
          </div>
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
            />
            مفعّلة (تظهر للعملاء)
          </label>
          <button
            type="submit"
            disabled={mut.isPending}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            {mut.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            حفظ
          </button>
        </form>
      </div>
    </div>
  );
}