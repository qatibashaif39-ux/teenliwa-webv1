import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Plus, Loader2, X, ShieldCheck, Shield } from "lucide-react";
import { toast } from "sonner";
import { listAppUsers, setUserAdmin, createAdminUser } from "@/lib/admins.functions";

export const Route = createFileRoute("/dashboard/admins")({
  ssr: false,
  component: DashboardAdmins,
});

function DashboardAdmins() {
  const qc = useQueryClient();
  const fetchUsers = useServerFn(listAppUsers);
  const toggleAdmin = useServerFn(setUserAdmin);
  const [creating, setCreating] = useState(false);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["app_users"],
    queryFn: () => fetchUsers(),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["app_users"] });

  const toggleMut = useMutation({
    mutationFn: (vars: { userId: string; makeAdmin: boolean }) => toggleAdmin({ data: vars }),
    onSuccess: () => {
      toast.success("تم تحديث الصلاحية");
      invalidate();
    },
    onError: (e: any) => toast.error(e?.message ?? "تعذّر التحديث"),
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">إدارة المدراء</h1>
        <button
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> مدير جديد
        </button>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">امنح أو اسحب صلاحية المدير لأي حساب مسجّل.</p>

      {isLoading ? (
        <div className="mt-8 text-center text-sm text-muted-foreground">جارٍ التحميل…</div>
      ) : (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {users.map((u) => (
            <div key={u.id} className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  u.isAdmin ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"
                }`}
              >
                {u.isAdmin ? <ShieldCheck className="h-5 w-5" /> : <Shield className="h-5 w-5" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate font-bold" dir="ltr">{u.email}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {u.isAdmin ? "مدير" : "مستخدم"}
                </div>
              </div>
              <button
                disabled={toggleMut.isPending}
                onClick={() => toggleMut.mutate({ userId: u.id, makeAdmin: !u.isAdmin })}
                className={`shrink-0 rounded-xl px-3 py-2 text-xs font-bold transition-colors disabled:opacity-60 ${
                  u.isAdmin
                    ? "border border-destructive/40 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                }`}
              >
                {u.isAdmin ? "إزالة المدير" : "تعيين مدير"}
              </button>
            </div>
          ))}
        </div>
      )}

      {creating && (
        <CreateAdminForm
          onClose={() => setCreating(false)}
          onSaved={() => {
            invalidate();
            setCreating(false);
          }}
        />
      )}
    </div>
  );
}

function CreateAdminForm({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const createFn = useServerFn(createAdminUser);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const mut = useMutation({
    mutationFn: () => createFn({ data: { email, password } }),
    onSuccess: () => {
      toast.success("تم إنشاء حساب المدير");
      onSaved();
    },
    onError: (e: any) => toast.error(e?.message ?? "تعذّر الإنشاء"),
  });

  const field = "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">مدير جديد</h2>
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
            type="email"
            dir="ltr"
            placeholder="البريد الإلكتروني"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className={field}
            type="password"
            dir="ltr"
            placeholder="كلمة المرور (6 أحرف على الأقل)"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="submit"
            disabled={mut.isPending}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            {mut.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            إنشاء مدير
          </button>
        </form>
      </div>
    </div>
  );
}