import { MapPin, Phone, User, Navigation } from "lucide-react";

export function Footer() {
    return (
        <footer className="mt-auto border-t border-border/60 bg-background/80 pb-20 backdrop-blur-lg md:pb-8">
            <div className="mx-auto max-w-6xl px-4">
                {/* المعلومات في صف واحد على الشاشات الكبيرة، وصفين على الموبايل */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {/* الاسم */}
                    <div className="flex flex-col items-center gap-2 text-center sm:flex-row sm:text-right">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <User className="h-4 w-4" />
                        </div>
                        <div>
                            <div className="text-xs font-semibold text-muted-foreground">
                                الاسم
                            </div>
                            <div className="text-sm font-bold">باسم</div>
                        </div>
                    </div>

                    {/* الموقع */}
                    <div className="flex flex-col items-center gap-2 text-center sm:flex-row sm:text-right">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <MapPin className="h-4 w-4" />
                        </div>
                        <div>
                            <div className="text-xs font-semibold text-muted-foreground">
                                الموقع
                            </div>
                            <div className="text-sm font-bold">أبوظبي</div>
                        </div>
                    </div>

                    {/* الهاتف */}
                    <div className="flex flex-col items-center gap-2 text-center sm:flex-row sm:text-right">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Phone className="h-4 w-4" />
                        </div>
                        <div>
                            <div className="text-xs font-semibold text-muted-foreground">
                                الهاتف
                            </div>
                            <div className="text-sm font-bold" dir="ltr">
                                504020220
                            </div>
                        </div>
                    </div>

                    {/* العنوان */}
                    <div className="flex flex-col items-center gap-2 text-center sm:flex-row sm:text-right">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Navigation className="h-4 w-4" />
                        </div>
                        <div>
                            <div className="text-xs font-semibold text-muted-foreground">
                                العنوان
                            </div>
                            <div className="text-sm font-bold">غير محدد</div>
                        </div>
                    </div>
                </div>

                {/* حقوق الملكية */}
                <div className="mt-6 border-t border-border/40 pt-4 text-center">
                    <p className="text-xs text-muted-foreground">
                        جميع الحقوق محفوظة © {new Date().getFullYear()}{" "}
                        gigatopx.com
                    </p>
                </div>
            </div>
        </footer>
    );
}
