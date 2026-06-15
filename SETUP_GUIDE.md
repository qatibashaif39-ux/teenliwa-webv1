# Teenliwa Web v1 - Supabase Setup Guide

## Prerequisites
- Node.js (v18+)
- npm or bun package manager
- Supabase account with a project created

## Configuration Steps

### 1. Environment Variables

Create a `.env.local` file in the root directory (already created) with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://broeqkpkbtxdtrvdbqkh.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_actual_publishable_key
```

**Important:** The `VITE_` prefix is required for Vite to expose these variables to the client-side code.

### 2. Get Your Keys from Supabase

1. Go to your Supabase project dashboard
2. Navigate to **Settings → API**
3. Copy the following:
   - **Project URL** → Set as `VITE_SUPABASE_URL`
   - **Anon Key** (public) → Set as `VITE_SUPABASE_PUBLISHABLE_KEY`
   - **Service Role Key** (private) → Set as `SUPABASE_SERVICE_KEY` (for server-side only)

### 3. Database Schema

The application uses three main tables:

#### Categories Table
```sql
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);
```

#### Products Table
```sql
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price NUMERIC NOT NULL DEFAULT 0,
  image_url TEXT,
  seed_key TEXT,
  available BOOLEAN NOT NULL DEFAULT TRUE,
  category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  min_qty INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);
```

#### Orders Table
```sql
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  tracking TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  items_json TEXT NOT NULL,
  total NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at BIGINT NOT NULL,
  cancelled_at BIGINT
);
```

### 4. Initialize Database (Option A: Using Node Script)

```bash
# Install dependencies
npm install

# Run the database setup script
node setup-db.js
```

This will:
- Create all tables if they don't exist
- Insert seed data (categories and products)
- Handle conflicts gracefully

### 5. Initialize Database (Option B: Manual SQL)

If the Node script doesn't work:

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy and paste the contents of `seed.sql`
4. Click **Run**

### 6. Verify Installation

Start the development server:

```bash
npm run dev
```

The app should load without the "Missing Supabase environment variables" error.

## Using Supabase in Your Code

### Import the Supabase Client

```typescript
import { supabase } from '@/lib/supabase';
```

### Fetch Categories

```typescript
const { data: categories, error } = await supabase
  .from('categories')
  .select('*')
  .order('sort_order', { ascending: true });
```

### Fetch Products by Category

```typescript
const { data: products, error } = await supabase
  .from('products')
  .select('*')
  .eq('category_id', categoryId)
  .eq('available', true)
  .order('sort_order', { ascending: true });
```

### Create an Order

```typescript
const { data: order, error } = await supabase
  .from('orders')
  .insert([
    {
      id: crypto.randomUUID(),
      tracking: generateTrackingNumber(),
      name: 'Customer Name',
      phone: '+966...',
      address: 'Customer Address',
      items_json: JSON.stringify(cartItems),
      total: cartTotal,
      status: 'pending',
      created_at: Date.now()
    }
  ])
  .select()
  .single();
```

## Troubleshooting

### Error: "Missing Supabase environment variables"

**Solution:** Ensure your `.env.local` file has:
- `VITE_SUPABASE_URL` (with `VITE_` prefix)
- `VITE_SUPABASE_PUBLISHABLE_KEY` (with `VITE_` prefix)

### Error: "Cannot connect to database"

**Possible causes:**
1. Check your Supabase project is running
2. Verify the database credentials in `.env.local`
3. Check network connectivity
4. Ensure your IP is whitelisted in Supabase

### Error: "Tables don't exist"

**Solution:** Run the setup script again:

```bash
node setup-db.js
```

### Error: "Permission denied"

**Solution:** Check your Supabase Row Level Security (RLS) policies:

1. Go to **Authentication → Policies** in Supabase
2. Ensure policies allow `SELECT` for public (anon) role
3. For write operations, configure appropriate policies

## Deployment to Vercel

When deploying to Vercel:

1. Add environment variables in Vercel project settings:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`

2. Make sure the variables are exposed to the build (they should be by default with `VITE_` prefix)

3. Redeploy your application

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
