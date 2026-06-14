import { createServerFn } from "@tanstack/react-start";

export const uploadImageFn = createServerFn({ method: "POST" })
  .inputValidator((d: { base64: string; filename: string }) => d)
  .handler(async ({ data }) => {
    const { handleUpload } = await import("./upload.server");
    return handleUpload(data);
  });
