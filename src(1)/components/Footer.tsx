import { MapPin, Phone, User, Navigation } from "lucide-react";

export function Footer() {
    return (
        <footer className="w-full border-t border-border/60 bg-background/80 py-6 backdrop-blur-lg">
            <div className="mx-auto max-w-6xl px-4">
                {/* صف المعلومات الرئيسية (الاسم - الموقع - الهاتف - العنوان) */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {/* 1. الاسم */}
                    <div className="flex flex-col items-center gap-1 text-center sm:flex-row sm:text-right">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <User className="h-4 w-4" />
                        </div>
                        <div>
                            <div className="text-[10px] font-semibold text-muted-foreground sm:text-xs">
                                الاسم
                            </div>
                            <div className="text-sm font-bold">test</div>{" "}
                            {/* غيّر "test" إلى اسمك */}
                        </div>
                    </div>

                    {/* 2. الموقع (المدينة/المنطقة) */}
                    <div className="flex flex-col items-center gap-1 text-center sm:flex-row sm:text-right">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <MapPin className="h-4 w-4" />
                        </div>
                        <div>
                            <div className="text-[10px] font-semibold text-muted-foreground sm:text-xs">
                                الموقع
                            </div>
                            <div className="text-sm font-bold">أبوظبي</div>{" "}
                            {/* غيّر "أبوظبي" إلى موقعك */}
                        </div>
                    </div>

                    {/* 3. رقم الهاتف */}
                    <div className="flex flex-col items-center gap-1 text-center sm:flex-row sm:text-right">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Phone className="h-4 w-4" />
                        </div>
                        <div>
                            <div className="text-[10px] font-semibold text-muted-foreground sm:text-xs">
                                الهاتف
                            </div>
                            <div className="text-sm font-bold" dir="ltr">
                                504020220 {/* غيّر إلى رقم هاتفك */}
                            </div>
                        </div>
                    </div>

                    {/* 4. العنوان التفصيلي */}
                    <div className="flex flex-col items-center gap-1 text-center sm:flex-row sm:text-right">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Navigation className="h-4 w-4" />
                        </div>
                        <div>
                            <div className="text-[10px] font-semibold text-muted-foreground sm:text-xs">
                                العنوان
                            </div>
                            <div className="text-sm font-bold">none</div>{" "}
                            {/* غيّر "none" إلى عنوانك الكامل */}
                        </div>
                    </div>
                </div>

                {/* حقوق النشر */}
                <div className="mt-6 border-t border-border/40 pt-4 text-center">
                    <p className="text-xs text-muted-foreground">
                        جميع الحقوق محفوظة © {new Date().getFullYear()} م.بلال
                        شائف
                    </p>
                </div>
            </div>
        </footer>
    );
}
