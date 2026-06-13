import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function handleUpload(data: { base64: string; filename: string }) {
  const result = await cloudinary.uploader.upload(data.base64, {
    folder: 'store_products',
    public_id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  });
  return { url: result.secure_url };
}