"use client";

import InputField from "@/components/common/InputField";

// APIs
import { useGetAcademicBranchesQuery } from "@/store/services/academicBranchesApi";
import { useGetInstituteBranchesQuery } from "@/store/services/instituteBranchesApi";

export default function Step1Student({
  register,
  errors,
  setValue,
  watch,
  onNext,
}) {
  const { data: branches } = useGetAcademicBranchesQuery();
  const { data: institutes } = useGetInstituteBranchesQuery();

  return (
    <div className="space-y-3">
      <InputField
        label="اسم الطالب"
        required
        placeholder="أدخل الاسم"
        register={register("first_name", {
          required: "الاسم مطلوب",
          minLength: { value: 2, message: "الاسم قصير جدًا" },
        })}
        error={errors.first_name?.message}
      />

      <InputField
        label="كنية الطالب"
        required
        placeholder="أدخل الكنية"
        register={register("last_name", {
          required: "الكنية مطلوبة",
          minLength: { value: 2, message: "الكنية قصيرة جدًا" },
        })}
        error={errors.last_name?.message}
      />

      <InputField
        label="مكان الولادة"
        required
        placeholder="مثال: دمشق"
        register={register("birth_place", {
          required: "مكان الولادة مطلوب",
        })}
        error={errors.birth_place?.message}
      />

      <InputField
        label="تاريخ الولادة"
        type="date"
        required
        register={register("date_of_birth", {
          required: "تاريخ الولادة مطلوب",
        })}
        error={errors.date_of_birth?.message}
      />

      <InputField
        label="الرقم الوطني"
        type="number"
        placeholder="10 أرقام فقط"
        required
        register={register("national_id", {
          required: "الرقم الوطني مطلوب",
          minLength: { value: 10, message: "10 أرقام فقط" },
          maxLength: { value: 10, message: "10 أرقام فقط" },
        })}
        error={errors.national_id?.message}
      />

      {/* الفرع الدراسي */}
      <div className="flex flex-col">
        <label className="text-sm">الفرع الدراسي</label>

        <select
          defaultValue=""
          className="border rounded-xl p-2 text-sm"
          {...register("branch_id", {
            required: "الفرع الدراسي مطلوب",
          })}
        >
          <option value="" disabled>
            اختر الفرع
          </option>
          {branches?.data?.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>

        <p className="text-xs text-red-500">{errors.branch_id?.message}</p>
      </div>

      {/* فرع المعهد */}
      <div className="flex flex-col">
        <label className="text-sm">فرع المعهد</label>

        <select
          defaultValue=""
          className="border rounded-xl p-2 text-sm"
          {...register("institute_branch_id", {
            required: "فرع المعهد مطلوب",
          })}
        >
          <option value="" disabled>
            اختر فرع المعهد
          </option>
          {institutes?.data?.map((i) => (
            <option key={i.id} value={i.id}>
              {i.name}
            </option>
          ))}
        </select>

        <p className="text-xs text-red-500">
          {errors.institute_branch_id?.message}
        </p>
      </div>

      <InputField
        label="المدرسة السابقة"
        placeholder="مثلاً: مدرسة الأمل"
        register={register("previous_school_name")}
        error={errors.previous_school_name?.message}
      />

      <InputField
        label="كيف عرفت بالمعهد؟"
        placeholder="اكتب الطريقة"
        register={register("how_know_institute")}
        error={errors.how_know_institute?.message}
      />

      <button
        type="button"
        onClick={onNext}
        className="w-full bg-[#6F013F] text-white py-2 rounded-lg mt-4"
      >
        التالي
      </button>
    </div>
  );
}
