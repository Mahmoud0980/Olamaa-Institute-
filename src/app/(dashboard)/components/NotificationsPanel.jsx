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

import {
  useGetExamResultEditRequestsQuery,
  useApproveExamResultEditRequestMutation,
  useRejectExamResultEditRequestMutation,
} from "@/store/services/examResultEditRequestsApi";

import GradientButton from "@/components/common/GradientButton";

const toArray = (res) =>
  Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];

function statusLabel(r) {
  const s = String(r?.status || "").toLowerCase();
  if (s === "pending") return "قيد الانتظار";
  if (s === "approved") return "مقبول";
  if (s === "rejected") return "مرفوض";
  return r?.status ?? "—";
}

function statusDot(r) {
  const type = String(r?.type || r?.action || "").toLowerCase();
  const s = String(r?.status || "").toLowerCase();

  if (s === "pending") return "/blueBoint.svg";
  if (s === "rejected") return "/redBoint.svg";
  if (type === "delete") return "/redBoint.svg";
  return "/blueBoint.svg";
}

/* ===== payment text ===== */
function paymentText(r) {
  const action = String(r?.action || "").toLowerCase();
  const paymentId =
    r?.payment_id ?? r?.payment?.id ?? r?.original_data?.id ?? "—";
  if (action === "delete") return `طلب حذف دفعة رقم (${paymentId}).`;
  return `طلب تعديل بيانات دفعة رقم (${paymentId}).`;
}

/* ===== grade text (your response) ===== */
function gradeText(r) {
  const type = String(r?.type || "").toLowerCase(); // update | delete
  const rid =
    r?.exam_result_id ?? r?.exam_result?.id ?? r?.original_data?.id ?? "—";

  const st = r?.exam_result?.student;
  const studentName =
    `${st?.first_name ?? ""} ${st?.last_name ?? ""}`.trim() ||
    `طالب #${r?.exam_result?.student_id ?? "—"}`;

  const examName =
    r?.exam_result?.exam?.name ?? `امتحان #${r?.exam_result?.exam_id ?? "—"}`;

  if (type === "delete")
    return `طلب حذف علامة (نتيجة #${rid}) للطالب ${studentName} (${examName}).`;

  // update: show obtained_marks diff if exists
  const before = r?.original_data?.obtained_marks;
  const after = r?.proposed_changes?.obtained_marks;

  const diff =
    after !== undefined && after !== null
      ? ` — العلامة: ${before ?? "—"} → ${after}`
      : "";

  return `طلب تعديل علامة (نتيجة #${rid}) للطالب ${studentName} (${examName})${diff}.`;
}

export default function NotificationsPanel() {
  // pending payments
  const {
    data: payRes,
    isLoading: loadingPay,
    isFetching: fetchingPay,
    refetch: refetchPay,
  } = useGetPaymentEditRequestsQuery(
    { status: "pending" },
    { pollingInterval: 10000, refetchOnFocus: true },
  );

  // pending grades
  const {
    data: gradeRes,
    isLoading: loadingGrade,
    isFetching: fetchingGrade,
    refetch: refetchGrade,
  } = useGetExamResultEditRequestsQuery(
    { status: "pending" },
    { pollingInterval: 10000, refetchOnFocus: true },
  );

  const [approvePay, { isLoading: approvingPay }] =
    useApprovePaymentEditRequestMutation();
  const [rejectPay, { isLoading: rejectingPay }] =
    useRejectPaymentEditRequestMutation();

  const [approveGrade, { isLoading: approvingGrade }] =
    useApproveExamResultEditRequestMutation();
  const [rejectGrade, { isLoading: rejectingGrade }] =
    useRejectExamResultEditRequestMutation();

  const loading = loadingPay || fetchingPay || loadingGrade || fetchingGrade;
  const busy = approvingPay || rejectingPay || approvingGrade || rejectingGrade;

  const items = useMemo(() => {
    const payments = toArray(payRes).map((x) => ({
      kind: "payment",
      id: x.id,
      created_at: x.created_at,
      raw: x,
      text: paymentText(x),
    }));

    const grades = toArray(gradeRes).map((x) => ({
      kind: "grade",
      id: x.id,
      created_at: x.created_at,
      raw: x,
      text: gradeText(x),
    }));

    const merged = [...payments, ...grades];

    // sort newest first
    merged.sort((a, b) =>
      String(b.created_at || "").localeCompare(String(a.created_at || "")),
    );

    // last 5
    return merged.slice(0, 5);
  }, [payRes, gradeRes]);

  const refresh = () => {
    refetchPay?.();
    refetchGrade?.();
  };

  const handleApprove = async (item) => {
    try {
      if (item.kind === "payment") {
        await approvePay(item.id).unwrap();
      } else {
        await approveGrade(item.id).unwrap();
      }
      notify.success("تم القبول");
      refresh();
    } catch (e) {
      notify.error(e?.data?.message || "فشل القبول");
    }
  };

  const handleReject = async (item) => {
    try {
      if (item.kind === "payment") {
        await rejectPay(item.id).unwrap();
      } else {
        await rejectGrade(item.id).unwrap();
      }
      notify.success("تم الرفض");
      refresh();
    } catch (e) {
      notify.error(e?.data?.message || "فشل الرفض");
    }
  };

  const rejectAll = async () => {
    if (!items.length) return;
    try {
      await Promise.all(
        items.map((it) =>
          it.kind === "payment"
            ? rejectPay(it.id).unwrap()
            : rejectGrade(it.id).unwrap(),
        ),
      );
      notify.success("تم رفض كل الطلبات المعروضة");
      refresh();
    } catch (e) {
      notify.error(e?.data?.message || "فشل رفض الكل");
    }
  };

  return (
    <section
      dir="rtl"
      className="w-full bg-[#FBFBFB] mt-8 p-4 shadow-lg rounded-lg"
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[16px] font-semibold text-gray-900">الإشعارات</h3>
        <Link
          href="/requests"
          className="text-xs text-[#7B0046] cursor-pointer"
        >
          عرض المزيد
        </Link>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="rounded-lg border border-dashed p-6 text-center text-sm text-gray-500">
            جارٍ التحميل...
          </div>
        ) : (
          <>
            {items.map((it) => {
              const r = it.raw;
              return (
                <div
                  key={`${it.kind}-${it.id}`}
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
                        {it.text}
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
                      <GradientButton
                        onClick={() => handleApprove(it)}
                        disabled={
                          busy || String(r?.status).toLowerCase() !== "pending"
                        }
                        className="px-6 py-2 rounded-md shadow-none"
                      >
                        قبول
                      </GradientButton>

                      <GradientButton
                        onClick={() => handleReject(it)}
                        disabled={
                          busy || String(r?.status).toLowerCase() !== "pending"
                        }
                        title="رفض"
                      >
                        إلغاء
                      </GradientButton>
                    </div>
                  </div>
                </div>
              );
            })}

            {items.length === 0 && (
              <div className="rounded-lg border border-dashed p-6 text-center text-sm text-gray-500">
                لا توجد إشعارات حالياً
              </div>
            )}
          </>
        )}
      </div>

      <button
        onClick={rejectAll}
        disabled={busy || !items.length}
        className="mt-3 w-full rounded-xl bg-gradient-to-l from-[#D40078] to-[#6D003E] py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
      >
        رفض الكل
      </button>
    </section>
  );
}
