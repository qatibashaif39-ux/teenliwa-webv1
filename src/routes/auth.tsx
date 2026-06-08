import { createFileRoute, Link } from "@tanstack/react-router";
import { Store } from "lucide-react";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "تسجيل الدخول — لوحة التحكم" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  return (
    <main className="flex min-h-[80vh] items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl border border-border/60 bg-card p-6 text-center">
        <div className="flex items-center justify-center gap-2">
          <Store className="h-6 w-6 text-primary" />
          <span className="text-lg font-extrabold">لوحة تحكم تين ليوا</span>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          لوحة التحكم مفتوحة للجميع في هذا الإصدار.
        </p>
        <Link
          to="/dashboard"
          className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          دخول لوحة التحكم
        </Link>
        <Link to="/" className="mt-3 block text-center text-xs text-muted-foreground hover:text-foreground">
          العودة للمتجر
        </Link>
      </div>
    </main>
  );
}