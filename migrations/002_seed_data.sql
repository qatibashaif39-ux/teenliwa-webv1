-- 002_seed_data.sql

-- Enable uuid generator (pgcrypto) for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Insert categories
INSERT INTO categories (id, name, sort_order) VALUES
  (gen_random_uuid()::text, 'تين', 1),
  (gen_random_uuid()::text, 'تمور', 2),
  (gen_random_uuid()::text, 'فواكه', 3),
  (gen_random_uuid()::text, 'مكسرات', 4)
ON CONFLICT DO NOTHING;

-- Note: gen_random_uuid() requires the pgcrypto extension on some setups.
-- If unavailable, replace with explicit UUID strings when running.

-- Seed products minimal (assumes categories exist)
-- We'll insert products using category names lookup
WITH cats AS (
  SELECT id, name FROM categories
)
INSERT INTO products (id, name, description, price, seed_key, available, category_id, sort_order, min_qty)
SELECT gen_random_uuid()::text, p.name, p.description, p.price, p.seed_key, p.available, c.id, p.sort_order, 1
FROM (VALUES
  ('تين أحمر طازج','كيلو تين أحمر طبيعي 100% طازج ولذيذ. القص والتوصيل في نفس اليوم!',100,'red-fig',true,1,'تين'),
  ('تين أصفر طازج','كيلو تين أصفر طازج طبيعي كالعسل — القص والتوصيل في نفس اليوم!',100,'yellow-fig',true,2,'تين'),
  ('تمر جلاكسي سكري','تمر سكري الطعم عسل، عبوة فاخرة.',150,'dates',true,3,'تمور'),
  ('تمر صقعي (3 كيلو)','تمر صقعي فاخر — عبوة 3 كيلو.',150,'dates',true,4,'تمور'),
  ('تمر شيشي (3 كيلو)','تمر شيشي فاخر — عبوة 3 كيلو.',150,'dates',true,5,'تمور'),
  ('تمر صفوي (3 كيلو)','تمر صفوي فاخر — عبوة 3 كيلو.',150,'dates',false,6,'تمور'),
  ('توت طويل','توت كيلو ب 100 درهم فاخر الطعم عسل.',100,'mulberry',false,7,'فواكه'),
  ('صبار كيلو','صبار طازج كيلو الطعم سكر.',100,'cactus',false,8,'فواكه'),
  ('فقع علبة 400 جرام','فقع درجة أولى — وزن 400 جرام.',150,'truffle',true,9,'فواكه'),
  ('لوز الحبان البحريني','لوز الحبان البحريني الفاخر.',200,'almonds',true,10,'مكسرات')
) AS p(name, description, price, seed_key, available, sort_order, cat_name)
JOIN cats c ON c.name = p.cat_name
ON CONFLICT DO NOTHING;
