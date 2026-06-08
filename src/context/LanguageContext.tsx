import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "ar" | "en";

type Translations = {
    [key in Language]: {
        [key: string]: string;
    };
};

const translations: Translations = {
    ar: {
        "nav.shop": "المتجر",
        "nav.orders": "طلباتي",
        "nav.track": "تتبع الطلب",
        "nav.about": "من نحن",
        "hero.title": "تين وتمور وفواكه فاخرة",
        "hero.delivery": " بالتوصيل",
        "hero.subtitle": "القص والتوصيل في نفس اليوم داخل الإمارات — طبيعي 100% وطازج.",
        "footer.rights": "جميع الحقوق محفوظة © {year} م.بلال شائف",
        "cart.title": "عربة التسوق",
        "cart.empty": "العربة فارغة",
        "cart.checkout": "إتمام الطلب",
        "about.title": "من نحن",
        "about.text": "تين ليوا متخصصون في توفير أجود أنواع التين والتمور والفواكه الطبيعية الطازجة، مع القص والتوصيل في نفس اليوم داخل دولة الإمارات. جودة فاخرة وطعم كالعسل.",
        "filter.all": "الكل",
        "product.add": "أضف إلى السلة",
        "product.upcoming": "قريباً",
    },
    en: {
        "nav.shop": "Shop",
        "nav.orders": "My Orders",
        "nav.track": "Track Order",
        "nav.about": "About Us",
        "hero.title": "Premium Figs, Dates & Fruits",
        "hero.delivery": " Delivery",
        "hero.subtitle": "Same-day harvest and delivery across UAE — 100% natural and fresh.",
        "footer.rights": "All rights reserved © {year} Eng. Bilal Shaif",
        "cart.title": "Shopping Cart",
        "cart.empty": "Your cart is empty",
        "cart.checkout": "Checkout",
        "about.title": "About Us",
        "about.text": "Teen Liwa specializes in providing the finest types of fresh natural figs, dates, and fruits, with same-day harvesting and delivery within the UAE. Premium quality and honey-like taste.",
        "filter.all": "All",
        "product.add": "Add to Cart",
        "product.upcoming": "Upcoming",
    },
};

type LanguageContextType = {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string, params?: Record<string, string | number>) => string;
    dir: "rtl" | "ltr";
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>("ar");

    useEffect(() => {
        document.documentElement.lang = language;
        document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    }, [language]);

    const t = (key: string, params?: Record<string, string | number>) => {
        let text = translations[language][key] || key;
        if (params) {
            Object.entries(params).forEach(([k, v]) => {
                text = text.replace(`{${k}}`, v.toString());
            });
        }
        return text;
    };

    const dir = language === "ar" ? "rtl" : "ltr";

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
};
