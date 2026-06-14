import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Loader2, X, ImagePlus } from "lucide-react";
import { toast } from "sonner";
import { CURRENCY, PLACEHOLDER_IMAGE, resolveProductImage } from "@/data/products";
import {
  fetchProducts,
  fetchCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  type ProductRow,
  type ProductInput,
} from "@/lib/catalog";
import { uploadImageFn } from "@/lib/upload";

export const Route = createFileRoute("/dashboard/products")({
  component: DashboardProducts,
});

const empty: ProductInput = {
  name: "",
  description: "",
  price: 0,
  image_url: null,
  available: true,
  category_id: null,
  sort_order: 0,
  min_qty: 1,
};

function DashboardProducts() {
  const qc = useQueryClient();
  const { data: products = [], isLoading } = useQuery({ queryKey: ["products"], queryFn: fetchProducts });
  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const [cat, setCat] = useState<string>("all");
  const [editing, setEditing] = useState<ProductRow | null>(null);
  const [creating, setCreating] = useState(false);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["products"] });

  const removeMut = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      toast.success("تم حذف المنتج");
      invalidate();
    },
    onError: (e: any) => toast.error(e?.message ?? "تعذّر الحذف"),
  });

  const list = useMemo(
    () => (cat === "all" ? products : products.filter((p) => p.category_id === cat)),
    [cat, products],
  );

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">المنتجات</h1>
        <button
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> منتج جديد
        </button>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">أضف المنتجات وعدّلها واحذفها.</p>

      <div className="mt-5 flex flex-wrap gap-2">
        <button onClick={() => setCat("all")} className={chip(cat === "all")}>الكل</button>
        {categories.map((c) => (
          <button key={c.id} onClick={() => setCat(c.id)} className={chip(cat === c.id)}>
            {c.name}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> جارٍ التحميل…
        </div>
      ) : list.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-border/60 bg-card p-8 text-center text-sm text-muted-foreground">
          لا توجد منتجات في هذا الصنف.
        </div>
      ) : (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {list.map((p) => (
            <div key={p.id} className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-3 transition-colors hover:border-primary/40">
              <img
                src={resolveProductImage({ image_url: p.image_url, seed_key: p.seed_key })}
                alt={p.name}
                className="h-16 w-16 shrink-0 rounded-xl object-cover"
                loading="lazy"
              />
              <div className="min-w-0 flex-1">
                <div className="truncate font-bold">{p.name}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">{p.category || "بدون صنف"}</div>
                <div className="mt-1 text-sm font-semibold text-primary">{p.price} {CURRENCY}</div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${p.available ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>
                  {p.available ? "متوفر" : "غير متوفر"}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setEditing(p)}
                    className="rounded-lg border border-border p-1.5 text-muted-foreground hover:text-foreground"
                    aria-label="تعديل"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => { if (confirm(`حذف المنتج "${p.name}"؟`)) removeMut.mutate(p.id); }}
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
        <ProductForm
          product={editing}
          categories={categories}
          onClose={() => { setCreating(false); setEditing(null); }}
          onSaved={() => { invalidate(); setCreating(false); setEditing(null); }}
        />
      )}
    </div>
  );
}

function chip(active: boolean) {
  return `rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
    active ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
  }`;
}

function ProductForm({
  product,
  categories,
  onClose,
  onSaved,
}: {
  product: ProductRow | null;
  categories: { id: string; name: string }[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<ProductInput>(
    product
      ? {
          name: product.name,
          description: product.description,
          price: product.price,
          image_url: product.image_url,
          available: product.available,
          category_id: product.category_id,
          sort_order: product.sort_order,
          min_qty: product.min_qty,
        }
      : empty,
  );

  // Local preview of selected image (base64)
  const [preview, setPreview] = useState<string | null>(
    product?.image_url ?? null,
  );
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Convert file → base64 preview, then upload on submit
  const [pendingFile, setPendingFile] = useState<{ base64: string; filename: string } | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const maxSize = 800; // max dimension to keep payload small
        
        if (width > height && width > maxSize) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        } else if (height > maxSize) {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        } else {
          // If smaller than max, just keep original dimensions
          width = img.width;
          height = img.height;
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        
        // compress as JPEG
        const base64 = canvas.toDataURL("image/jpeg", 0.7);
        setPreview(base64);
        setPendingFile({ base64, filename: file.name });
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  const mut = useMutation({
    mutationFn: async () => {
      let finalImageUrl = form.image_url;

      // Upload image if one was selected
      if (pendingFile) {
        setUploading(true);
        try {
          const result = await uploadImageFn({ data: pendingFile });
          finalImageUrl = result.url;
        } finally {
          setUploading(false);
        }
      }

      const finalForm = { ...form, image_url: finalImageUrl };
      if (product) await updateProduct(product.id, finalForm);
      else await createProduct(finalForm);
    },
    onSuccess: () => {
      toast.success(product ? "تم تحديث المنتج" : "تمت إضافة المنتج");
      onSaved();
    },
    onError: (e: any) => toast.error(e?.message ?? "تعذّر الحفظ"),
  });

  const field = "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary";
  const currentImage = preview ?? resolveProductImage({ image_url: form.image_url, seed_key: undefined });
  const isBusy = mut.isPending || uploading;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-border/60 bg-card p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">{product ? "تعديل منتج" : "منتج جديد"}</h2>
          <button onClick={onClose} aria-label="إغلاق" className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); mut.mutate(); }}
          className="mt-4 space-y-3"
        >
          {/* Image upload area */}
          <div
            className="group relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-border bg-secondary/40 transition-colors hover:border-primary"
            style={{ minHeight: 140 }}
            onClick={() => fileRef.current?.click()}
          >
            {currentImage && currentImage !== PLACEHOLDER_IMAGE ? (
              <img
                src={currentImage}
                alt="معاينة"
                className="h-36 w-full object-cover opacity-80 transition-opacity group-hover:opacity-60"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
                <ImagePlus className="h-8 w-8" />
                <span className="text-xs font-semibold">اضغط لاختيار صورة</span>
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
              <span className="rounded-xl bg-black/60 px-3 py-1.5 text-xs font-bold text-white">
                <ImagePlus className="mr-1 inline h-3 w-3" />
                تغيير الصورة
              </span>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          <input
            className={field}
            placeholder="رابط الصورة (أو اختر ملفاً أعلاه)"
            value={form.image_url ?? ""}
            onChange={(e) => {
              setForm({ ...form, image_url: e.target.value || null });
              if (e.target.value) setPreview(e.target.value);
              else setPreview(null);
              setPendingFile(null);
            }}
          />

          <input
            className={field}
            placeholder="اسم المنتج"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <textarea
            className={field}
            placeholder="الوصف"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div className="flex gap-3">
            <input
              className={field}
              type="number"
              min={0}
              step="0.01"
              placeholder="السعر"
              required
              value={form.price}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
            />
            <input
              className={field}
              type="number"
              min={1}
              placeholder="أقل كمية"
              required
              value={form.min_qty}
              onChange={(e) => setForm({ ...form, min_qty: Number(e.target.value) })}
            />
            <input
              className={field}
              type="number"
              placeholder="الترتيب"
              value={form.sort_order}
              onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
            />
          </div>
          <select
            className={field}
            value={form.category_id ?? ""}
            onChange={(e) => setForm({ ...form, category_id: e.target.value || null })}
          >
            <option value="">بدون صنف</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input
              type="checkbox"
              checked={form.available}
              onChange={(e) => setForm({ ...form, available: e.target.checked })}
            />
            متوفر للبيع
          </label>
          <button
            type="submit"
            disabled={isBusy}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            {isBusy && <Loader2 className="h-4 w-4 animate-spin" />}
            {uploading ? "جارٍ رفع الصورة…" : "حفظ"}
          </button>
        </form>
      </div>
    </div>
  );
}
