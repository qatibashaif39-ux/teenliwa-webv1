
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.categories TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are viewable by everyone"
ON public.categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can insert categories"
ON public.categories FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update categories"
ON public.categories FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete categories"
ON public.categories FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  price numeric NOT NULL DEFAULT 0,
  image_url text,
  seed_key text,
  available boolean NOT NULL DEFAULT true,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.products TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products are viewable by everyone"
ON public.products FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can insert products"
ON public.products FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update products"
ON public.products FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete products"
ON public.products FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.categories (name, sort_order) VALUES
  ('تين', 1), ('تمور', 2), ('فواكه', 3), ('مكسرات', 4);

INSERT INTO public.products (name, description, price, seed_key, available, category_id, sort_order)
VALUES
  ('تين أحمر طازج', 'كيلو تين أحمر طبيعي 100% طازج ولذيذ. القص والتوصيل في نفس اليوم!', 100, 'red-fig', true, (SELECT id FROM public.categories WHERE name='تين'), 1),
  ('تين أصفر طازج', 'كيلو تين أصفر طازج طبيعي كالعسل — القص والتوصيل في نفس اليوم!', 100, 'yellow-fig', true, (SELECT id FROM public.categories WHERE name='تين'), 2),
  ('تمر جلاكسي سكري', 'تمر سكري الطعم عسل، عبوة فاخرة.', 150, 'dates', true, (SELECT id FROM public.categories WHERE name='تمور'), 3),
  ('تمر صقعي (3 كيلو)', 'تمر صقعي فاخر — عبوة 3 كيلو.', 150, 'dates', true, (SELECT id FROM public.categories WHERE name='تمور'), 4),
  ('تمر شيشي (3 كيلو)', 'تمر شيشي فاخر — عبوة 3 كيلو.', 150, 'dates', true, (SELECT id FROM public.categories WHERE name='تمور'), 5),
  ('تمر صفوي (3 كيلو)', 'تمر صفوي فاخر — عبوة 3 كيلو.', 150, 'dates', false, (SELECT id FROM public.categories WHERE name='تمور'), 6),
  ('توت طويل', 'توت كيلو ب 100 درهم فاخر الطعم عسل.', 100, 'mulberry', false, (SELECT id FROM public.categories WHERE name='فواكه'), 7),
  ('صبار كيلو', 'صبار طازج كيلو الطعم سكر.', 100, 'cactus', false, (SELECT id FROM public.categories WHERE name='فواكه'), 8),
  ('فقع علبة 400 جرام', 'فقع درجة أولى — وزن 400 جرام.', 150, 'truffle', true, (SELECT id FROM public.categories WHERE name='فواكه'), 9),
  ('لوز الحبان البحريني', 'لوز الحبان البحريني الفاخر.', 200, 'almonds', true, (SELECT id FROM public.categories WHERE name='مكسرات'), 10);
