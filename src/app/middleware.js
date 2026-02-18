import { NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login"]; // صفحات عامة

export function middleware(req) {
  const { pathname } = req.nextUrl;

  // تجاهل ملفات next و api والملفات العامة
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // إذا المسار عام لا تفحص
  if (
    PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))
  ) {
    return NextResponse.next();
  }

  // اعتبر باقي المسارات محمية (عدّل حسب مشروعك)
  const token = req.cookies.get("token")?.value;

  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
