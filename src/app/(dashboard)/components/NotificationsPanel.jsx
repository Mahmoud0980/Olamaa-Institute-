"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";

import { notify } from "@/lib/helpers/toastify";

import {
  useGetPaymentEditRequestsQuery,
  useApprovePaymentEditRequestMutation,
  useRejectPaymentEditRequestMutation,
} from "@/store/services/paymentEditRequestsApi";
import GradientButton from "@/components/common/GradientButton";

const toArray = (res) =>
  Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];

function formatReqText(r) {
  const action = String(r?.action || "").toLowerCase(); // delete | update/edit
  const paymentId =
    r?.payment_id ?? r?.payment?.id ?? r?.original_data?.id ?? "—";

  if (action === "delete") return `طلب حذف دفعة رقم (${paymentId}).`;
  return `طلب تعديل بيانات دفعة رقم (${paymentId}).`;
}

function statusLabel(r) {
  const s = String(r?.status || "").toLowerCase();
  if (s === "pending") return "قيد الانتظار";
  if (s === "approved") return "مقبول";
  if (s === "rejected") return "مرفوض";
  return r?.status ?? "—";
}

function statusDot(r) {
  // نفس شكل الصورة عندك: pending أزرق، وشي أحمر (مثلاً delete أو rejected)
  const action = String(r?.action || "").toLowerCase();
  const s = String(r?.status || "").toLowerCase();

  if (s === "pending") return "/blueBoint.svg";
  if (s === "rejected") return "/redBoint.svg";
  if (action === "delete") return "/redBoint.svg";
  return "/blueBoint.svg";
}

export default function NotificationsPanel() {
  const { data, isLoading, isFetching, refetch } =
    useGetPaymentEditRequestsQuery(
      { status: "pending" },
      {
        pollingInterval: 10000,
        refetchOnFocus: true,
      }
    );

  const items = useMemo(() => {
    const list = toArray(data);
    // ✅ عرض آخر 5 طلبات (مثل التنبيه المصغر)
    return [...list].slice(0, 5);
  }, [data]);

  const loading = isLoading || isFetching;

  const [approve, { isLoading: approving }] =
    useApprovePaymentEditRequestMutation();
  const [reject, { isLoading: rejecting }] =
    useRejectPaymentEditRequestMutation();

  const handleApprove = async (req) => {
    try {
      const res = await approve(req.id).unwrap();
      notify.success(res?.message || "تم القبول");
      refetch(); // ✅ تحديث فوري
    } catch (e) {
      notify.error(e?.data?.message || "فشل القبول");
    }
  };

  const handleReject = async (req) => {
    try {
      const res = await reject(req.id).unwrap();
      notify.success(res?.message || "تم الرفض");
      refetch(); // ✅ تحديث فوري
    } catch (e) {
      notify.error(e?.data?.message || "فشل الرفض");
    }
  };

  const rejectAll = async () => {
    if (!items.length) return;

    try {
      await Promise.all(items.map((r) => reject(r.id).unwrap()));
      notify.success("تم رفض كل الطلبات المعروضة");
      refetch(); // ✅ تحديث فوري
    } catch (e) {
      notify.error(e?.data?.message || "فشل رفض الكل");
    }
  };

  return (
    <section
      dir="rtl"
      className="w-full bg-[#FBFBFB] mt-8 p-4 shadow-lg rounded-lg"
    >
      {/* رأس اللوحة */}
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[16px] font-semibold text-gray-900">الإشعارات</h3>

        {/* ✅ عرض المزيد -> صفحة الطلبات */}
        <Link
          href="/requests"
          className="text-xs text-[#7B0046] cursor-pointer"
        >
          عرض المزيد
        </Link>
      </div>

      {/* البطاقات */}
      <div className="space-y-3">
        {loading ? (
          <div className="rounded-lg border border-dashed p-6 text-center text-sm text-gray-500">
            جارٍ التحميل...
          </div>
        ) : (
          <>
            {items.map((r) => (
              <div
                key={r.id}
                className="rounded-xl border border-gray-400 p-3 shadow-sm bg-transparent my-4"
              >
                <div className="flex gap-3">
                  <div className="flex -space-x-3 rtl:space-x-reverse shrink-0">
                    <img
                      src={"/avt.svg"}
                      alt=""
                      className="h-8 w-8 rounded-full ring-2 ring-white object-cover"
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[12px] leading-5 text-gray-600 line-clamp-2">
                      {formatReqText(r)}
                    </p>

                    <div className="mt-2">
                      <Image
                        src={statusDot(r)}
                        alt=""
                        width={12}
                        height={12}
                        className="inline-block ml-1 mb-0.5"
                      />
                      <span>{statusLabel(r)}</span>
                    </div>
                  </div>
                </div>

                <hr className="mt-4 mb-2" />

                <div className="mt-2 flex flex-col justify-between">
                  <div className="flex flex-row justify-between items-center gap-2 text-[11px] text-gray-500">
                    <span className="flex text-[12px] px-2 py-1">
                      <Image
                        src={"/calendar.svg"}
                        width={15}
                        height={15}
                        alt="calendar"
                        className="ml-2"
                      />
                      {String(r?.created_at || "").slice(0, 10) || "—"}
                    </span>
                    <span className="text-[12px] px-2 py-1">
                      {String(r?.created_at || "").slice(11, 16) || "—"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center gap-1 mt-2">
                    {/* ✅ قبول = GradientButton */}
                    <GradientButton
                      onClick={() => handleApprove(r)}
                      disabled={approving || rejecting}
                      className="px-6 py-2 rounded-md shadow-none"
                    >
                      قبول
                    </GradientButton>

                    <GradientButton
                      onClick={() => handleReject(r)}
                      disabled={approving || rejecting}
                      title="رفض"
                    >
                      إلغاء
                    </GradientButton>
                  </div>
                </div>
              </div>
            ))}

            {items.length === 0 && (
              <div className="rounded-lg border border-dashed p-6 text-center text-sm text-gray-500">
                لا توجد إشعارات حالياً
              </div>
            )}
          </>
        )}
      </div>

      {/* زر رفض الكل */}
      <button
        onClick={rejectAll}
        disabled={approving || rejecting || !items.length}
        className="mt-3 w-full rounded-xl bg-gradient-to-l from-[#D40078] to-[#6D003E] py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
      >
        رفض الكل
      </button>
    </section>
  );
}
