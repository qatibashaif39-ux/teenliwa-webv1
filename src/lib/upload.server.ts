import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function handleUpload(data: { base64: string; filename: string }) {
  // 1. تنظيف base64
  const base64Data = data.base64.replace(/^data:image\/[a-z]+;base64,/, "");
  const buffer = Buffer.from(base64Data, "base64");

  // 2. اسم فريد للملف
  const ext = data.filename.split(".").pop()?.toLowerCase() ?? "jpg";
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  // 3. رفع إلى Supabase Storage
  const { error } = await supabase.storage
    .from('product-images')
    .upload(safeName, buffer, {
      contentType: `image/${ext}`,
    });

  if (error) {
    console.error('Supabase upload error:', error);
    throw new Error('فشل رفع الصورة');
  }

  // 4. الحصول على الرابط العام
  const { data: publicUrlData } = supabase.storage
    .from('product-images')
    .getPublicUrl(safeName);

  return { url: publicUrlData.publicUrl };
}