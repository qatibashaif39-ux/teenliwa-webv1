import { supabase } from "@/integrations/supabase/client";
import { resolveProductImage, type Product } from "@/data/products";

export interface Category {
  id: string;
  name: string;
  sort_order: number;
}

// Raw product row joined with category, plus admin-only fields.
export interface ProductRow {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  seed_key: string | null;
  available: boolean;
  category_id: string | null;
  sort_order: number;
  category: string;
  image: string;
minimum_order_quantity: number; 
}

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, sort_order")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data as Category[];
}

export async function fetchProducts(): Promise<ProductRow[]> {
  const { data, error } = await supabase
    .from("products")
    .select("id, name, description, price, image_url, seed_key, available, category_id, sort_order, categories(name)")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    id: row.id,
    name: row.name,
    description: row.description ?? "",
    price: Number(row.price),
    image_url: row.image_url,
    seed_key: row.seed_key,
    available: row.available,
    category_id: row.category_id,
    sort_order: row.sort_order,
    category: row.categories?.name ?? "",
    image: resolveProductImage({ image_url: row.image_url, seed_key: row.seed_key }),
    minimum_order_quantity:
    row.minimum_order_quantity ?? 1,
  }));
}

// Maps a product row to the unified Product shape used by the storefront/cart.
export function toProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    image: row.image,
    category: row.category,
    available: row.available,
    minimum_order_quantity:row.minimum_order_quantity,
  };
}

export interface ProductInput {
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  available: boolean;
  category_id: string | null;
  sort_order: number;
minimum_order_quantity: number; 
}

export async function createProduct(input: ProductInput) {
  const { error } = await supabase.from("products").insert(input);
  if (error) throw error;
}

export async function updateProduct(id: string, input: Partial<ProductInput>) {
  const { error } = await supabase.from("products").update(input).eq("id", id);
  if (error) throw error;
}

export async function deleteProduct(id: string) {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}

export async function createCategory(name: string, sort_order: number) {
  const { error } = await supabase.from("categories").insert({ name, sort_order });
  if (error) throw error;
}

export async function updateCategory(id: string, fields: { name?: string; sort_order?: number }) {
  const { error } = await supabase.from("categories").update(fields).eq("id", id);
  if (error) throw error;
}

export async function deleteCategory(id: string) {
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw error;
}

// ---------- Product image upload (private bucket + long-lived signed URL) ----------
const SIGNED_URL_TTL = 60 * 60 * 24 * 365 * 5; // ~5 years

export async function uploadProductImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from("product-images")
    .upload(path, file, { cacheControl: "31536000", upsert: false });
  if (error) throw error;
  const { data, error: signErr } = await supabase.storage
    .from("product-images")
    .createSignedUrl(path, SIGNED_URL_TTL);
  if (signErr) throw signErr;
  return data.signedUrl;
}

// ---------- Delivery zones ----------
export interface DeliveryZone {
  id: string;
  name: string;
  fee: number;
  active: boolean;
  sort_order: number;
}

export async function fetchDeliveryZones(activeOnly = false): Promise<DeliveryZone[]> {
  let query = supabase
    .from("delivery_zones")
    .select("id, name, fee, active, sort_order")
    .order("sort_order", { ascending: true });
  if (activeOnly) query = query.eq("active", true);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map((z: any) => ({ ...z, fee: Number(z.fee) }));
}

export interface DeliveryZoneInput {
  name: string;
  fee: number;
  active: boolean;
  sort_order: number;
}

export async function createDeliveryZone(input: DeliveryZoneInput) {
  const { error } = await supabase.from("delivery_zones").insert(input);
  if (error) throw error;
}

export async function updateDeliveryZone(id: string, input: Partial<DeliveryZoneInput>) {
  const { error } = await supabase.from("delivery_zones").update(input).eq("id", id);
  if (error) throw error;
}

export async function deleteDeliveryZone(id: string) {
  const { error } = await supabase.from("delivery_zones").delete().eq("id", id);
  if (error) throw error;
}