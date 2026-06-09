import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

export async function handleUpload(data: { base64: string; filename: string }) {
  const uploadsDir = join(process.cwd(), "public", "uploads");
  mkdirSync(uploadsDir, { recursive: true });

  // Strip the data:image/xxx;base64, prefix
  const base64Data = data.base64.replace(/^data:image\/[a-z]+;base64,/, "");
  const buffer = Buffer.from(base64Data, "base64");

  // Sanitize filename and ensure unique name
  const ext = data.filename.split(".").pop()?.toLowerCase() ?? "jpg";
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const filePath = join(uploadsDir, safeName);

  writeFileSync(filePath, buffer);

  return { url: `/uploads/${safeName}` };
}
