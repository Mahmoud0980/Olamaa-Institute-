"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import api from "@/lib/config/axiosConfig";
import { isLoggedIn, setAuth } from "@/lib/helpers/auth";

import InputField from "@/components/common/InputField";
import GradientButton from "@/components/common/GradientButton";

export default function LoginPage() {
  const router = useRouter();

  const [idOrEmail, setIdOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // redirect إذا مسجل
  useEffect(() => {
    if (isLoggedIn()) router.replace("/");
  }, [router]);

  async function onSubmit(e) {
    e.preventDefault();

    if (!idOrEmail || !password) {
      toast.error("يرجى إدخال جميع الحقول");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("auth/login", {
        email: idOrEmail,
        unique_id: idOrEmail,
        password,
      });

      const data = res.data;

      if (!data?.status) {
        throw new Error(data?.message || "فشل تسجيل الدخول");
      }

      setAuth({
        token: data.data.token,
        user: data.data.user,
      });

      toast.success("تم تسجيل الدخول بنجاح");
      router.replace("/");
    } catch (error) {
      const msg =
        error?.response?.data?.message || error?.message || "حدث خطأ غير متوقع";
      toast.error(msg);
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
          <InputField
            label="البريد أو رقم المعرّف"
            placeholder="example@mail.com أو OAD-00001"
            required
            value={idOrEmail}
            register={{
              value: idOrEmail,
              onChange: (e) => setIdOrEmail(e.target.value),
            }}
          />

          <InputField
            label="كلمة المرور"
            type="password"
            placeholder="••••••••"
            required
            value={password}
            register={{
              value: password,
              onChange: (e) => setPassword(e.target.value),
            }}
          />

          <GradientButton
            type="submit"
            disabled={loading}
            className="w-full justify-center py-2.5 rounded-xl"
          >
            {loading ? "جاري الدخول..." : "دخول"}
          </GradientButton>
        </form>

        <p className="mt-4 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} جميع الحقوق محفوظة
        </p>
      </div>
    </main>
  );
}
