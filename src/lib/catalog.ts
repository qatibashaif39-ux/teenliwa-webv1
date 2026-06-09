import { createServerFn } from "@tanstack/react-start";
import { resolveProductImage, type Product } from "@/data/products";

export interface Category {
  id: string;
  name: string;
  sort_order: number;
}

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
  min_qty: number;
  category: string;
  image: string;
}

export interface ProductInput {
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  available: boolean;
  category_id: string | null;
  sort_order: number;
  min_qty: number;
}

export function toProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    image: row.image,
    category: row.category,
    available: row.available,
    min_qty: row.min_qty,
  };
}

// fetchCategories
const fetchCategoriesFn = createServerFn({ method: "GET" })
  .handler(async () => {
    const { getCategories } = await import("./catalog.server");
    return getCategories();
  });
export async function fetchCategories(): Promise<Category[]> {
  return fetchCategoriesFn();
}

// fetchProducts
const fetchProductsFn = createServerFn({ method: "GET" })
  .handler(async () => {
    const { getProducts } = await import("./catalog.server");
    return getProducts();
  });
export async function fetchProducts(): Promise<ProductRow[]> {
  return fetchProductsFn();
}

// createProduct
const createProductFn = createServerFn({ method: "POST" })
  .inputValidator((d: ProductInput) => d)
  .handler(async ({ data }) => {
    const { insertProduct } = await import("./catalog.server");
    return insertProduct(data);
  });
export async function createProduct(input: ProductInput): Promise<void> {
  await createProductFn({ data: input });
}

// updateProduct
const updateProductFn = createServerFn({ method: "POST" })
  .inputValidator((d: { id: string; input: Partial<ProductInput> }) => d)
  .handler(async ({ data }) => {
    const { editProduct } = await import("./catalog.server");
    return editProduct(data.id, data.input);
  });
export async function updateProduct(id: string, input: Partial<ProductInput>): Promise<void> {
  await updateProductFn({ data: { id, input } });
}

// deleteProduct
const deleteProductFn = createServerFn({ method: "POST" })
  .inputValidator((id: string) => id)
  .handler(async ({ data: id }) => {
    const { removeProduct } = await import("./catalog.server");
    return removeProduct(id);
  });
export async function deleteProduct(id: string): Promise<void> {
  await deleteProductFn({ data: id });
}

// createCategory
const createCategoryFn = createServerFn({ method: "POST" })
  .inputValidator((d: { name: string; sort_order: number }) => d)
  .handler(async ({ data }) => {
    const { insertCategory } = await import("./catalog.server");
    return insertCategory(data.name, data.sort_order);
  });
export async function createCategory(name: string, sort_order: number): Promise<void> {
  await createCategoryFn({ data: { name, sort_order } });
}

// updateCategory
const updateCategoryFn = createServerFn({ method: "POST" })
  .inputValidator((d: { id: string; fields: { name?: string; sort_order?: number } }) => d)
  .handler(async ({ data }) => {
    const { editCategory } = await import("./catalog.server");
    return editCategory(data.id, data.fields);
  });
export async function updateCategory(id: string, fields: { name?: string; sort_order?: number }): Promise<void> {
  await updateCategoryFn({ data: { id, fields } });
}

// deleteCategory
const deleteCategoryFn = createServerFn({ method: "POST" })
  .inputValidator((id: string) => id)
  .handler(async ({ data: id }) => {
    const { removeCategory } = await import("./catalog.server");
    return removeCategory(id);
  });
export async function deleteCategory(id: string): Promise<void> {
  await deleteCategoryFn({ data: id });
}
