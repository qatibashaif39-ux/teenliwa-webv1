import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function handleUpload(data: { base64: string; filename: string }) {
  const base64Data = data.base64.replace(/^data:image\/[a-z]+;base64,/, "");
  const buffer = Buffer.from(base64Data, "base64");
  const ext = data.filename.split(".").pop()?.toLowerCase() ?? "jpg";
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage
    .from('product-images')
    .upload(safeName, buffer, { contentType: `image/${ext}` });

  if (error) {
    console.error('Supabase upload error:', error);
    throw new Error('فشل رفع الصورة: ' + error.message);
  }

  const { data: publicUrlData } = supabase.storage.from('product-images').getPublicUrl(safeName);
  return { url: publicUrlData.publicUrl };
}