"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import api from "@/lib/config/axiosConfig";
import { isLoggedIn, setAuth } from "@/lib/helpers/auth";

import FormInput from "@/components/common/InputField";
import GradientButton from "@/components/common/GradientButton";

function Sparkle({ className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`absolute text-[#D40078]/35 ${className}`}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2l1.7 6.1L20 10l-6.3 1.9L12 18l-1.7-6.1L4 10l6.3-1.9L12 2z" />
    </svg>
  );
}

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
    <main className="min-h-dvh  flex items-center justify-center p-4" dir="">
      {/* OUTER SHEET */}
      <div
        className="w-full max-w-5xl  rounded-[28px]  overflow-hidden"
        dir="rtl"
      >
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* LEFT: LOGO (hidden on mobile) */}

          {/* RIGHT: FORM */}
          <section className="flex items-center justify-center p-6 md:p-10 bg-white">
            <div className="w-full max-w-md">
              {/* inner card like screenshot */}
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm px-6 sm:px-10 py-12 min-h-[460px] flex flex-col">
                <h1 className="text-xl sm:text-2xl font-bold text-center text-gray-900">
                  تسجيل الدخول
                </h1>

                {/* خلي الفورم يملأ الارتفاع */}
                <form
                  onSubmit={onSubmit}
                  className="mt-10 flex-1 flex flex-col justify-between"
                >
                  {/* inputs */}
                  <div className="space-y-6">
                    <FormInput
                      label="اسم المستخدم"
                      placeholder="الاسم"
                      required
                      value={idOrEmail}
                      register={{
                        value: idOrEmail,
                        onChange: (e) => setIdOrEmail(e.target.value),
                      }}
                    />

                    <FormInput
                      label="كلمة السر"
                      type="password"
                      placeholder="••••••••"
                      required
                      value={password}
                      register={{
                        value: password,
                        onChange: (e) => setPassword(e.target.value),
                      }}
                    />
                  </div>

                  {/* button (ينزل لتحت) */}
                  <div className="pt-8">
                    <GradientButton
                      type="submit"
                      disabled={loading}
                      className="w-full justify-center py-3 rounded-xl"
                    >
                      {loading ? "جاري الدخول..." : "تسجيل الدخول"}
                    </GradientButton>
                  </div>
                </form>
              </div>
            </div>
          </section>
          <section
            className="hidden md:flex relative items-center justify-center p-10 bg-white"
            dir="rtl"
          >
            {/* sparkles */}
            <Sparkle className="w-4 h-4 left-12 top-10" />
            <Sparkle className="w-5 h-5 left-24 top-24" />
            <Sparkle className="w-3.5 h-3.5 left-16 bottom-16" />
            <Sparkle className="w-4 h-4 left-40 bottom-24" />
            <Sparkle className="w-6 h-6 left-20 top-40 text-[#6D003E]/30" />
            <Sparkle className="w-3.5 h-3.5 left-56 top-16" />
            <Sparkle className="w-4 h-4 left-64 bottom-20" />

            <div className="flex flex-col items-center justify-center gap-4">
              <Image
                src="/icons/bigLogo.png"
                alt="معهد العلماء للتعليم"
                width={260}
                height={260}
                priority
                className="select-none"
              />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
