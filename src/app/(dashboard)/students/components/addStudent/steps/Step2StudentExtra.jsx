"use client";

import InputField from "@/components/common/InputField";
import UploadImagesField from "@/components/common/UploadImagesField";

import { useGetCitiesQuery } from "@/store/services/citiesApi";
import { useGetBusesQuery } from "@/store/services/busesApi";
import { useGetStudentStatusesQuery } from "@/store/services/studentStatusesApi";

export default function Step2StudentExtra({
  register,
  errors,
  setValue,
  watch,
  onNext,
  onBack,
}) {
  const today = new Date().toISOString().split("T")[0];

  // API data
  const { data: cities } = useGetCitiesQuery();
  const { data: buses } = useGetBusesQuery();
  const { data: statuses } = useGetStudentStatusesQuery();

  return (
    <div className="space-y-4">
      {/* ======================= */}
      {/* 🔥 الجنس */}
      {/* ======================= */}
      <div className="flex flex-col gap-1">
        <label className="text-sm">الجنس</label>
        <select
          className="border border-gray-200 rounded-xl p-2 text-sm"
          {...register("gender", { required: "الرجاء اختيار الجنس" })}
          defaultValue=""
        >
          <option value="" disabled>
            اختر الجنس
          </option>
          <option value="male">ذكر</option>
          <option value="female">أنثى</option>
        </select>

        <p className="text-xs text-red-500">{errors.gender?.message}</p>
      </div>

      {/* ======================= */}
      {/* 🔥 المدينة */}
      {/* ======================= */}
      <div className="flex flex-col gap-1">
        <label className="text-sm">المدينة</label>

        <select
          {...register("city_id")}
          className="border border-gray-200 rounded-xl p-2 text-sm"
          defaultValue=""
        >
          <option value="" disabled>
            اختر المدينة
          </option>

          {cities?.data?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <p className="text-xs text-red-500">{errors.city_id?.message}</p>
      </div>

      {/* ======================= */}
      {/* 🔥 باص النقل */}
      {/* ======================= */}
      <div className="flex flex-col gap-1">
        <label className="text-sm">الباص</label>

        <select
          {...register("bus_id")}
          className="border border-gray-200 rounded-xl p-2 text-sm"
          defaultValue=""
        >
          <option value="" disabled>
            اختر الباص
          </option>

          {buses?.data?.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name} — {b.capacity} مقعد
            </option>
          ))}
        </select>

        <p className="text-xs text-red-500">{errors.bus_id?.message}</p>
      </div>

      {/* ======================= */}
      {/* 🔥 حالة الطالب */}
      {/* ======================= */}
      <div className="flex flex-col gap-1">
        <label className="text-sm">حالة الطالب</label>

        <select
          className="border border-gray-200 rounded-xl p-2 text-sm"
          {...register("status_id", {
            required: "حالة الطالب مطلوبة",
          })}
          defaultValue=""
        >
          <option value="" disabled>
            اختر حالة الطالب
          </option>

          {statuses?.data?.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        <p className="text-xs text-red-500">{errors.status_id?.message}</p>
      </div>

      {/* ======================= */}
      {/* 🔥 الملاحظات */}
      {/* ======================= */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">ملاحظات</label>
        <textarea
          {...register("notes")}
          rows={3}
          placeholder="اختياري"
          className="border border-gray-200 rounded-xl p-2 text-sm"
        />
      </div>

      {/* ======================= */}
      {/* 🔥 التواريخ */}
      {/* ======================= */}
      <InputField
        label="تاريخ التسجيل"
        type="date"
        defaultValue={today}
        readOnly
        register={register("enrollment_date", {
          required: "تاريخ التسجيل مطلوب",
        })}
        error={errors.enrollment_date?.message}
      />

      <InputField
        label="تاريخ بدء الحضور"
        type="date"
        register={register("start_attendance_date")}
        error={errors.start_attendance_date?.message}
      />

      {/* ======================= */}
      {/* 🔥 الصور */}
      {/* ======================= */}
      <UploadImagesField
        label="رفع صورة الطالب وصورة الهوية"
        nameProfile="profile_photo"
        nameId="id_card_photo"
        setValue={setValue}
        watch={watch}
      />

      {/* أزرار التنقل */}
      <div className="flex justify-between mt-6">
        <button
          type="button"
          onClick={onBack}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg"
        >
          السابق
        </button>

        <button
          type="button"
          onClick={onNext}
          className="bg-[#6F013F] text-white px-4 py-2 rounded-lg"
        >
          التالي
        </button>
      </div>
    </div>
  );
}
