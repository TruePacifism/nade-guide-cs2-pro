import { supabase } from "@/integrations/supabase/client";

const MEDIA_BUCKET = "grenade-media";
const SIGNED_URL_EXPIRES_IN = 60 * 60;

const isExternalUrl = (value?: string | null) =>
  typeof value === "string" && /^https?:\/\//i.test(value);

export const getSignedMediaUrl = async (path?: string | null) => {
  if (!path) return null;
  if (isExternalUrl(path)) return path;

  const { data, error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .createSignedUrl(path, SIGNED_URL_EXPIRES_IN);

  if (error) {
    console.error("Failed to create signed URL", error);
    return null;
  }

  return data?.signedUrl ?? null;
};

export const attachSignedMediaUrls = async <T extends Record<string, any>>(
  item: T,
): Promise<T> => {
  const [video_url, setup_image_url, aim_image_url, result_image_url] =
    await Promise.all([
      getSignedMediaUrl(item.video_url),
      getSignedMediaUrl(item.setup_image_url),
      getSignedMediaUrl(item.aim_image_url),
      getSignedMediaUrl(item.result_image_url),
    ]);

  return {
    ...item,
    video_url,
    setup_image_url,
    aim_image_url,
    result_image_url,
  };
};
