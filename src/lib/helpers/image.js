import api from "@/lib/config/axiosConfig";

/**
 * يحوّل photo_path من الـ API
 * إلى رابط صورة صالح للعرض
 */
export const resolveImageUrl = (path) => {
  if (!path) return null;

  const base = api.defaults.baseURL || "";

  // إزالة /api من النهاية
  const origin = base.replace(/\/api\/?$/, "").replace(/\/$/, "");

  return `${origin}/storage/${path}`;
};
