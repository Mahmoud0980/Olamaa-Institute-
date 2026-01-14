"use client";

import InputField from "@/components/common/InputField";
import SearchableSelect from "@/components/common/SearchableSelect";
import StepButtonsSmart from "@/components/common/StepButtonsSmart";
import { Controller } from "react-hook-form";

import { useGetAcademicBranchesQuery } from "@/store/services/academicBranchesApi";
import { useGetInstituteBranchesQuery } from "@/store/services/instituteBranchesApi";

export default function Step1Student({
  control,
  register,
  errors,
  onNext,
  onBack,
}) {
  const { data: branchesRes } = useGetAcademicBranchesQuery();
  const { data: institutesRes } = useGetInstituteBranchesQuery();

  const branches = branchesRes?.data || [];
  const institutes = institutesRes?.data || [];

  return (
    <div className="space-y-4">
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
        type="text"
        placeholder="10 أرقام فقط"
        required
        register={register("national_id", {
          required: "الرقم الوطني مطلوب",
          pattern: {
            value: /^[0-9]{10}$/,
            message: "يجب إدخال 10 أرقام فقط",
          },
          onChange: (e) => {
            // يمنع إدخال أكثر من 10 أرقام
            e.target.value = e.target.value.replace(/\D/g, "").slice(0, 10);
          },
        })}
        error={errors.national_id?.message}
      />

      {/* branch_id */}
      <Controller
        control={control}
        name="branch_id"
        rules={{ required: "الفرع الدراسي مطلوب" }}
        render={({ field }) => (
          <SearchableSelect
            label="الفرع الدراسي"
            required
            value={field.value || ""}
            onChange={field.onChange}
            options={branches.map((b, idx) => ({
              key: `${b.id}-${idx}`,
              value: String(b.id),
              label: b.name,
            }))}
            placeholder="اختر الفرع"
            allowClear
          />
        )}
      />
      <p className="text-xs text-red-500">{errors.branch_id?.message}</p>

      {/* institute_branch_id */}
      <Controller
        control={control}
        name="institute_branch_id"
        rules={{ required: "فرع المعهد مطلوب" }}
        render={({ field }) => (
          <SearchableSelect
            label="فرع المعهد"
            required
            value={field.value || ""}
            onChange={field.onChange}
            options={institutes.map((i, idx) => ({
              key: `${i.id}-${idx}`,
              value: String(i.id),
              label: i.name,
            }))}
            placeholder="اختر فرع المعهد"
            allowClear
          />
        )}
      />
      <p className="text-xs text-red-500">
        {errors.institute_branch_id?.message}
      </p>

      <StepButtonsSmart step={1} total={6} onNext={onNext} onBack={onBack} />
    </div>
  );
}
