import redFig from "@/assets/red-fig.jpg";
import yellowFig from "@/assets/yellow-fig.jpg";
import dates from "@/assets/dates.jpg";
import mulberry from "@/assets/mulberry.jpg";
import cactus from "@/assets/cactus.jpg";
import truffle from "@/assets/truffle.jpg";
import almonds from "@/assets/almonds.jpg";

export type Category = "تين" | "تمور" | "فواكه" | "مكسرات";
//export const CURRENCY="د.إ";
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
 category: Category;
 //Category:string;
  available: boolean;
}

export const CURRENCY = "د.إ";
// Bundled fallback images for the originally-seeded products (keyed by seed_key).
/*export const SEED_IMAGES: Record<string, string> = {
  "red-fig": redFig,
  "yellow-fig": yellowFig,
  dates,
  mulberry,
  cactus,
  truffle,
  almonds,
};
*/
export const categories: Category[] = ["تين", "تمور", "فواكه", "مكسرات"];

// Neutral placeholder for products without an image.
/*export const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect width='400' height='400' fill='%231f1f1f'/%3E%3Ctext x='50%25' y='50%25' fill='%23777' font-size='28' text-anchor='middle' dominant-baseline='middle' font-family='sans-serif'%3E%D9%84%D8%A7 %D8%AA%D9%88%D8%AC%D8%AF %D8%B5%D9%88%D8%B1%D8%A9%3C/text%3E%3C/svg%3E";
*/
export const products: Product[] = [
  {
    id: "red-fig",
    name: "تين أحمر طازج",
    description: "كيلو تين أحمر طبيعي 100% طازج ولذيذ. القص والتوصيل في نفس اليوم!",
    price: 100,
    image: redFig,
    category: "تين",
    available: true,
  },
  {
    id: "yellow-fig",
    name: "تين أصفر طازج",
    description: "كيلو تين أصفر طازج طبيعي كالعسل — القص والتوصيل في نفس اليوم!",
    price: 100,
    image: yellowFig,
    category: "تين",
    available: true,
  },
  {
    id: "tmr-sokary",
    name: "تمر جلاكسي سكري",
    description: "تمر سكري الطعم عسل، عبوة فاخرة.",
    price: 150,
    image: dates,
    category: "تمور",
    available: true,
  },
  {
    id: "tmr-saqai",
    name: "تمر صقعي (3 كيلو)",
    description: "تمر صقعي فاخر — عبوة 3 كيلو.",
    price: 150,
    image: dates,
    category: "تمور",
    available: true,
  },
  {
    id: "tmr-shishi",
    name: "تمر شيشي (3 كيلو)",
    description: "تمر شيشي فاخر — عبوة 3 كيلو.",
    price: 150,
    image: dates,
    category: "تمور",
    available: true,
  },
  {
    id: "tmr-safawi",
    name: "تمر صفوي (3 كيلو)",
    description: "تمر صفوي فاخر — عبوة 3 كيلو.",
    price: 150,
    image: dates,
    category: "تمور",
    available: false,
  },
  {
    id: "mulberry",
    name: "توت طويل",
    description: "توت كيلو ب 100 درهم فاخر الطعم عسل.",
    price: 100,
    image: mulberry,
    category: "فواكه",
    available: false,
  },
  {
    id: "cactus",
    name: "صبار كيلو",
    description: "صبار طازج كيلو الطعم سكر.",
    price: 100,
    image: cactus,
    category: "فواكه",
    available: false,
  },
  {
    id: "truffle",
    name: "فقع علبة 400 جرام",
    description: "فقع درجة أولى — وزن 400 جرام.",
    price: 150,
    image: truffle,
    category: "فواكه",
    available: true,
  },
  {
    id: "almonds",
    name: "لوز الحبان البحريني",
    description: "لوز الحبان البحريني الفاخر.",
    price: 200,
    image: almonds,
    category: "مكسرات",
    available: true,
  },
];

/*export function resolveProductImage(opts: { image_url?: string | null; seed_key?: string | null }): string {
  if (opts.image_url) return opts.image_url;
  if (opts.seed_key && SEED_IMAGES[opts.seed_key]) return SEED_IMAGES[opts.seed_key];
  return PLACEHOLDER_IMAGE;
}*/
export function resolveProductImage(opts: { image_url?: string | null; seed_key?: string | null }): string {
  if (opts.image_url) return opts.image_url;
  if (opts.seed_key && SEED_IMAGES[opts.seed_key]) return SEED_IMAGES[opts.seed_key];
  return PLACEHOLDER_IMAGE;
}
