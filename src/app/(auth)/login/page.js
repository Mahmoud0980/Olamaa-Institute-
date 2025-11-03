// app/login/page.js
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn, setAuth } from "@/lib/helpers/auth";

//const API_URL = "http://james90-001-site1.mtempurl.com/api/login";
const API_URL = "https://olamaa-institute.onrender.com/api/login";

export default function LoginPage() {
  const router = useRouter();
  const [idOrEmail, setIdOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // إذا مسجل دخول، روح على الداشبورد
  useEffect(() => {
    if (isLoggedIn()) router.replace("/");
  }, [router]);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        // منبعت email و unique_id مع بعض بالإضافة لكلمة السر
        body: JSON.stringify({
          email: idOrEmail,
          unique_id: idOrEmail,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data?.status) {
        throw new Error(data?.message || "فشل تسجيل الدخول");
      }

      const token = data?.data?.token;
      const user = data?.data?.user;

      if (!token || !user) {
        throw new Error("استجابة غير متوقعة من الخادم");
      }

      // خزن باللوكل ستوريج
      setAuth({ token, user });

      // روح على الصفحة الرئيسية (الداشبورد)
      router.replace("/dashboard");
    } catch (e) {
      setErr(e.message || "حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-dvh grid place-items-center bg-[#F7F7F7]" dir="rtl">
      <div className="w-full max-w-[420px] bg-white rounded-2xl shadow p-6">
        <h1 className="text-2xl font-bold text-center mb-1">تسجيل الدخول</h1>
        <p className="text-center text-gray-500 mb-6">
          يرجى إدخال بيانات حسابك للمتابعة
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">
              البريد أو رقم المعرّف
            </label>
            <input
              type="text"
              value={idOrEmail}
              onChange={(e) => setIdOrEmail(e.target.value)}
              className="w-full h-11 rounded-xl border border-gray-200 px-3 outline-none focus:ring-2 focus:ring-purple-400"
              placeholder="example@mail.com أو OAD-00001"
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">كلمة المرور</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 rounded-xl border border-gray-200 px-3 pr-12 outline-none focus:ring-2 focus:ring-purple-400"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute inset-y-0 left-2 my-auto px-2 text-sm text-purple-700"
                aria-label={showPw ? "إخفاء" : "إظهار"}
              >
                {showPw ? "إخفاء" : "إظهار"}
              </button>
            </div>
          </div>

          {err ? (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
              {err}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl bg-gradient-to-b from-[#D40078] to-[#6D003E] text-white font-bold disabled:opacity-60"
          >
            {loading ? "جاري الدخول..." : "دخول"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} جميع الحقوق محفوظة
        </p>
      </div>
    </main>
  );
}
