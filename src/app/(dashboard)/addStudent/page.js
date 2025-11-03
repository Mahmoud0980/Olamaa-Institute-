"use client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch, useSelector } from "react-redux";

// سلايسات القوائم
import { fetchBranches } from "../../../redux/Slices/instituteBranchesSlice"; // institute_branch_id
import { fetchAcademicBranches } from "../../../redux/Slices/academicBranchesSlice"; // branch_id
import { fetchBuses } from "../../../redux/Slices/busesSlice";
import { fetchStudentStatuses } from "../../../redux/Slices/studentStatusSlice";
import { fetchCities } from "../../../redux/Slices/citiesSlice";

// ثنك الإضافة
import {
  addStudent,
  probeFamily,
} from "../../../redux/Slices/createStudentsSlice";

// سكّيما مدمجة (طالب + أولياء + شرط تواريخ)
import { studentFormSchema } from "../../../lib/helpers/schemas";

// كومبوننت رقم الهاتف
import { PhoneInput } from "../../../lib/helpers/phoneLengths";

/* Helpers */
const toStr = (v) => (v === undefined || v === null ? "" : String(v));
const keep = (v) => (v === "" || v === undefined || v === null ? undefined : v);

// YYYY-MM-DD دائماً نص
const d = (v) => (v ? String(v).slice(0, 10) : undefined);

// يشيل المفاتيح اللي قيمتها undefined
const prune = (obj) =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));
const isDateOrderValid = (enroll, start) =>
  !enroll || !start || String(start) >= String(enroll);

/** 👇 فحص شامل لإشارة "عائلة موجودة" سواء عبر message أو data.family */
const isFamilyMatch = (obj) => {
  if (!obj) return false;
  const msg = obj?.message || obj?.data?.message || "";
  const byMsg =
    typeof msg === "string" && msg.includes("تم العثور على عائلة موجودة");
  const byData = !!obj?.data?.family?.id;
  return byMsg || byData;
};

const getFamilyId = (obj) => obj?.data?.family?.id ?? null;

/** 👇 بناء payload بالشكل المطلوب من الباك */
const buildPayload = (v, opts = {}) => {
  const { familyId = undefined, isExistingFamilyConfirmed } = opts;

  const student = prune({
    institute_branch_id: keep(toStr(v.institute_branch_id)),
    branch_id: keep(toStr(v.branch_id)),
    user_id: v.user_id ?? undefined,

    first_name: toStr(v.first_name).trim(),
    last_name: toStr(v.last_name).trim(),
    full_name: `${toStr(v.first_name).trim()} ${toStr(v.last_name).trim()}`,
    date_of_birth: d(v.date_of_birth),
    birth_place: keep(toStr(v.birth_place)),

    profile_photo_url: null,
    id_card_photo_url: null,

    enrollment_date: d(v.enrollment_date),
    start_attendance_date: d(v.start_attendance_date),

    gender: keep(toStr(v.gender)),
    previous_school_name: keep(toStr(v.previous_school_name)),
    national_id: keep(toStr(v.national_id)),
    how_know_institute: keep(toStr(v.how_know_institute)),
    bus_id: keep(toStr(v.bus_id)),
    notes: keep(toStr(v.notes)),
    status_id: keep(toStr(v.status_id)),
    city_id: keep(toStr(v.city_id)),

    family_id: familyId ? toStr(familyId) : undefined,
  });

  const father = prune({
    first_name: toStr(v.father_first_name).trim(),
    last_name: toStr(v.father_last_name).trim(),
    relationship: "father",
    phone: keep(toStr(v.father_phone)) ?? null,
  });

  const mother = prune({
    first_name: toStr(v.mother_first_name).trim(),
    last_name: toStr(v.mother_last_name).trim(),
    relationship: "mother",
    phone: keep(toStr(v.mother_phone)) ?? null,
  });

  const payload = { student, father, mother };

  // منطق واجهة فقط – أضفها فقط بمرحلة التأكيد
  if (typeof isExistingFamilyConfirmed === "boolean") {
    payload.is_existing_family_confirmed = isExistingFamilyConfirmed;
  }

  return payload;
};

export default function AddStudentForm() {
  const dispatch = useDispatch();

  // مودال ربط العائلة
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingFamilyId, setPendingFamilyId] = useState(null);
  const [cachedValues, setCachedValues] = useState(null);

  // القوائم
  const instBranches = useSelector((s) => s.branches.list || []);
  const instBranchesStatus = useSelector((s) => s.branches.status);

  const academicBranches = useSelector((s) => s.academicBranches.list || []);
  const academicBranchesStatus = useSelector((s) => s.academicBranches.status);

  const buses = useSelector((s) => s.buses.list || []);
  const busesStatus = useSelector((s) => s.buses.status);

  const statuses = useSelector((s) => s.studentStatus.list || []);
  const statusesStatus = useSelector((s) => s.studentStatus.status);

  const cities = useSelector((s) => s.cities.list || []);
  const citiesStatus = useSelector((s) => s.cities.status);

  useEffect(() => {
    if (!instBranches.length) dispatch(fetchBranches());
    if (!academicBranches.length) dispatch(fetchAcademicBranches());
    if (!buses.length) dispatch(fetchBuses());
    if (!statuses.length) dispatch(fetchStudentStatuses());
    if (!cities.length) dispatch(fetchCities());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const [step, setStep] = useState(1);

  const {
    register,
    handleSubmit,
    trigger,
    setError,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(studentFormSchema),
    mode: "onBlur",
    defaultValues: {
      // الخطوة 1
      first_name: "",
      last_name: "",
      gender: "",
      date_of_birth: "",
      birth_place: "",
      profile_photo: undefined,
      id_card_photo: undefined,

      // الخطوة 2
      institute_branch_id: "",
      branch_id: "",
      enrollment_date: "",
      start_attendance_date: "",
      status_id: "",
      bus_id: "",
      city_id: "",
      user_id: "",
      previous_school_name: "",
      national_id: "",
      how_know_institute: "",

      // الخطوة 3
      father_first_name: "",
      father_last_name: "",
      mother_first_name: "",
      mother_last_name: "",
      father_phone: "",
      mother_phone: "",

      // الخطوة 4
      notes: "",
    },
  });

  const stepFields = {
    1: [
      "first_name",
      "last_name",
      "gender",
      "date_of_birth",
      "birth_place",
      "profile_photo",
      "id_card_photo",
    ],
    2: [
      "institute_branch_id",
      "branch_id",
      "enrollment_date",
      "start_attendance_date",
      "status_id",
      "bus_id",
      "city_id",
      "user_id",
      "previous_school_name",
      "national_id",
      "how_know_institute",
    ],
    3: [
      "father_first_name",
      "father_last_name",
      "mother_first_name",
      "mother_last_name",
    ],
    4: ["notes"],
  };

  const nextStep = async () => {
    const ok = await trigger(stepFields[step] || [], { shouldFocus: true });

    if (ok && step === 2) {
      const { enrollment_date, start_attendance_date } = getValues();
      if (!isDateOrderValid(enrollment_date, start_attendance_date)) {
        setError("start_attendance_date", {
          type: "manual",
          message: "تاريخ بدء الحضور يجب أن يكون بعد أو يساوي تاريخ التسجيل",
        });
        return;
      }
    }

    if (ok) setStep((x) => x + 1);
  };

  const prevStep = () => setStep((x) => Math.max(1, x - 1));

  const applyServerErrors = (payload) => {
    const errs = payload?.errors;
    let stepToFocus = null;

    if (errs && typeof errs === "object") {
      for (const [key, msgs] of Object.entries(errs)) {
        const msg = Array.isArray(msgs) ? msgs[0] : String(msgs);
        if (key.startsWith("student.")) {
          const k = key.replace("student.", "");
          setError(k, { type: "server", message: msg });
          if (!stepToFocus) stepToFocus = 2;
        } else if (key.startsWith("father.")) {
          const sub = key.replace("father.", "");
          const map = {
            first_name: "father_first_name",
            last_name: "father_last_name",
          };
          if (map[sub]) setError(map[sub], { type: "server", message: msg });
          if (!stepToFocus) stepToFocus = 3;
        } else if (key.startsWith("mother.")) {
          const sub = key.replace("mother.", "");
          const map = {
            first_name: "mother_first_name",
            last_name: "mother_last_name",
          };
          if (map[sub]) setError(map[sub], { type: "server", message: msg });
          if (!stepToFocus) stepToFocus = 3;
        }
      }
      if (stepToFocus) setStep(stepToFocus);
      alert("فشل التحقق من السيرفر. صحّح الحقول المعلّمة.");
    } else {
      alert(payload?.message || "خطأ في التحقق من البيانات");
    }
  };

  /** ✅ نعم = true */
  const handleConfirmYes = async () => {
    if (!cachedValues) return;
    try {
      const payload = buildPayload(cachedValues, {
        familyId: pendingFamilyId,
        isExistingFamilyConfirmed: true,
      });
      const resp = await dispatch(addStudent(payload)).unwrap();
      setConfirmOpen(false);
      setCachedValues(null);
      setPendingFamilyId(null);
      alert("✅ تم ربط الطالب بالعائلة وحفظه بنجاح");
      console.log("✅ confirm YES resp:", resp);
    } catch (err) {
      setConfirmOpen(false);
      applyServerErrors(err);
    }
  };

  const handleConfirmNo = async () => {
    if (!cachedValues) return;
    try {
      const payload = buildPayload(cachedValues, {
        isExistingFamilyConfirmed: false, // يصرّح نعمل إضافة بدون ربط
      });
      const resp = await dispatch(addStudent(payload)).unwrap();
      setConfirmOpen(false);
      setCachedValues(null);
      setPendingFamilyId(null);
      alert("✅ تم إنشاء عائلة جديدة وحفظ الطالب");
      console.log("✅ confirm NO resp:", resp);
    } catch (err) {
      setConfirmOpen(false);
      applyServerErrors(err);
    }
  };

  const onSubmit = async (values) => {
    if (
      !isDateOrderValid(values.enrollment_date, values.start_attendance_date)
    ) {
      setStep(2);
      setError("start_attendance_date", {
        type: "manual",
        message: "تاريخ بدء الحضور يجب أن يكون بعد أو يساوي تاريخ التسجيل",
      });
      return;
    }

    try {
      // 1) فحص فقط — لا تضيف
      const probePayload = buildPayload(values);
      let probeResp;
      try {
        probeResp = await dispatch(probeFamily(probePayload)).unwrap();
        console.log("🔎 probe success:", probeResp);
        if (isFamilyMatch(probeResp)) {
          setPendingFamilyId(getFamilyId(probeResp));
          setCachedValues(values);
          setConfirmOpen(true);
          return;
        }
      } catch (probeErr) {
        console.log("🔎 probe reject:", probeErr);
        if (isFamilyMatch(probeErr)) {
          setPendingFamilyId(getFamilyId(probeErr));
          setCachedValues(values);
          setConfirmOpen(true);
          return;
        }
        // إذا ما كانت رسالة عائلة موجودة، طبّق أخطاء 422 العادية إن وجدت
        applyServerErrors(probeErr);
        return;
      }

      // 2) لا توجد عائلة مطابقة => أضف مباشرة
      const addPayload = buildPayload(values); // بدون family_id
      await dispatch(addStudent(addPayload)).unwrap();
      alert("✅ تم إضافة الطالب بنجاح");
    } catch (err) {
      applyServerErrors(err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl shadow-md">
      <h2 className="text-xl font-semibold mb-4">إضافة طالب</h2>

      {/* شريط التقدم */}
      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3, 4].map((n) => (
          <span
            key={n}
            className={`h-2 flex-1 rounded ${
              step >= n ? "bg-blue-600" : "bg-gray-200"
            }`}
          />
        ))}
      </div>

      <form
        onSubmit={(e) => e.preventDefault()} // منع الإرسال التلقائي
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault(); // ممنوع Enter يعمل submit
            if (step < 4) nextStep();
          }
        }}
      >
        {/* === الخطوة 1 === */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-1">الاسم الأول</label>
              <input
                className="w-full border rounded px-3 py-2"
                {...register("first_name")}
              />
              {errors.first_name && (
                <p className="text-sm text-red-600">
                  {errors.first_name.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm mb-1">الكنية</label>
              <input
                className="w-full border rounded px-3 py-2"
                {...register("last_name")}
              />
              {errors.last_name && (
                <p className="text-sm text-red-600">
                  {errors.last_name.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm mb-1">الجنس</label>
              <select
                className="w-full border rounded px-3 py-2"
                {...register("gender", {
                  setValueAs: (v) => (v === "" ? undefined : v),
                })}
              >
                <option value="">-- اختر --</option>
                <option value="male">ذكر</option>
                <option value="female">أنثى</option>
              </select>
              {errors.gender && (
                <p className="text-sm text-red-600">{errors.gender.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm mb-1">تاريخ الميلاد</label>
              <input
                type="date"
                className="w-full border rounded px-3 py-2"
                {...register("date_of_birth")}
              />
              {errors.date_of_birth && (
                <p className="text-sm text-red-600">
                  {errors.date_of_birth.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm mb-1">مكان الولادة</label>
              <input
                className="w-full border rounded px-3 py-2"
                {...register("birth_place")}
              />
            </div>
            <div>
              <label className="block text-sm mb-1">الصورة الشخصية</label>
              <input
                type="file"
                accept="image/*"
                className="w-full border rounded px-3 py-2"
                // مهم: React Hook Form يلتقط FileList من target.files
                {...register("profile_photo")}
                onChange={(e) => {
                  // نضمن تمرير FileList للفورم
                  const files = e.target.files;
                  // اختياري: يمكنك إبقاءه كما هو بدون setValue
                  // setValue("profile_photo", files, { shouldDirty: true, shouldValidate: true });
                }}
              />
              {errors.profile_photo && (
                <p className="text-sm text-red-600">
                  {errors.profile_photo.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm mb-1">صورة الهوية</label>
              <input
                type="file"
                accept="image/*"
                className="w-full border rounded px-3 py-2"
                {...register("id_card_photo")}
                onChange={(e) => {
                  const files = e.target.files;
                  // setValue("id_card_photo", files, { shouldDirty: true, shouldValidate: true });
                }}
              />
              {errors.id_card_photo && (
                <p className="text-sm text-red-600">
                  {errors.id_card_photo.message}
                </p>
              )}
            </div>
          </div>
        )}

        {/* === الخطوة 2 === */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-1">
                فرع المعهد (Institute)
              </label>
              <select
                className="w-full border rounded px-3 py-2"
                {...register("institute_branch_id")}
              >
                <option value="">-- اختر فرعًا --</option>
                {instBranches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name || `فرع #${b.id}`}
                  </option>
                ))}
              </select>
              {errors.institute_branch_id && (
                <p className="text-sm text-red-600">
                  {errors.institute_branch_id.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm mb-1">
                الفرع الدراسي (Academic)
              </label>
              <select
                className="w-full border rounded px-3 py-2"
                {...register("branch_id")}
              >
                <option value="">-- اختر الفرع الدراسي --</option>
                {academicBranches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name || `فرع دراسي #${b.id}`}
                  </option>
                ))}
              </select>
              {errors.branch_id && (
                <p className="text-sm text-red-600">
                  {errors.branch_id.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">تاريخ التسجيل</label>
                <input
                  type="date"
                  className="w-full border rounded px-3 py-2"
                  {...register("enrollment_date")}
                />
                {errors.enrollment_date && (
                  <p className="text-sm text-red-600">
                    {errors.enrollment_date.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm mb-1">تاريخ بدء الدوام</label>
                <input
                  type="date"
                  className="w-full border rounded px-3 py-2"
                  {...register("start_attendance_date")}
                />
                {errors.start_attendance_date && (
                  <p className="text-sm text-red-600">
                    {errors.start_attendance_date.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm mb-1">الحالة</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  {...register("status_id", {
                    setValueAs: (v) => (v === "" ? undefined : v),
                  })}
                >
                  <option value="">-- اختر الحالة --</option>
                  {statuses.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name || `حالة #${st.id}`}
                    </option>
                  ))}
                </select>
                {errors.status_id && (
                  <p className="text-sm text-red-600">
                    {errors.status_id.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm mb-1">الباص</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  {...register("bus_id", {
                    setValueAs: (v) => (v === "" ? undefined : v),
                  })}
                >
                  <option value="">-- بدون باص --</option>
                  {buses.map((bus) => (
                    <option key={bus.id} value={bus.id}>
                      {bus.name || `باص #${bus.id}`}
                    </option>
                  ))}
                </select>
                {errors.bus_id && (
                  <p className="text-sm text-red-600">
                    {errors.bus_id.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm mb-1">المدينة</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  {...register("city_id", {
                    setValueAs: (v) => (v === "" ? undefined : v),
                  })}
                >
                  <option value="">-- اختر المدينة --</option>
                  {cities.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name || `مدينة #${c.id}`}
                    </option>
                  ))}
                </select>
                {errors.city_id && (
                  <p className="text-sm text-red-600">
                    {errors.city_id.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm mb-1">User ID (اختياري)</label>
                <input
                  className="w-full border rounded px-3 py-2"
                  {...register("user_id", {
                    setValueAs: (v) => (v === "" ? undefined : Number(v)),
                  })}
                />
                {errors.user_id && (
                  <p className="text-sm text-red-600">
                    {errors.user_id.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm mb-1">
                  المدرسة السابقة (اختياري)
                </label>
                <input
                  className="w-full border rounded px-3 py-2"
                  {...register("previous_school_name")}
                />
              </div>
              <div>
                <label className="block text-sm mb-1">
                  الرقم الوطني (اختياري)
                </label>
                <input
                  className="w-full border rounded px-3 py-2"
                  {...register("national_id")}
                />
                {errors.national_id && (
                  <p className="text-sm text-red-600">
                    {errors.national_id.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm mb-1">
                كيف عرفت بالمعهد؟ (اختياري)
              </label>
              <input
                className="w-full border rounded px-3 py-2"
                {...register("how_know_institute")}
              />
            </div>
          </div>
        )}

        {/* === الخطوة 3 === */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <div className="font-medium mb-2">الأب</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1">اسم الأب</label>
                  <input
                    className="w-full border rounded px-3 py-2"
                    {...register("father_first_name")}
                  />
                  {errors.father_first_name && (
                    <p className="text-sm text-red-600">
                      {errors.father_first_name.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm mb-1">كنية الأب</label>
                  <input
                    className="w-full border rounded px-3 py-2"
                    {...register("father_last_name")}
                  />
                  {errors.father_last_name && (
                    <p className="text-sm text-red-600">
                      {errors.father_last_name.message}
                    </p>
                  )}
                </div>
              </div>

              <PhoneInput
                name="father_phone"
                register={register}
                value={getValues("father_phone")}
                onChange={(val) =>
                  setValue("father_phone", val, { shouldDirty: true })
                }
                error={errors.father_phone?.message}
              />
            </div>

            <div>
              <div className="font-medium mb-2">الأم</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1">اسم الأم</label>
                  <input
                    className="w-full border rounded px-3 py-2"
                    {...register("mother_first_name")}
                  />
                  {errors.mother_first_name && (
                    <p className="text-sm text-red-600">
                      {errors.mother_first_name.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm mb-1">كنية الأم</label>
                  <input
                    className="w-full border rounded px-3 py-2"
                    {...register("mother_last_name")}
                  />
                  {errors.mother_last_name && (
                    <p className="text-sm text-red-600">
                      {errors.mother_last_name.message}
                    </p>
                  )}
                </div>
              </div>

              <PhoneInput
                name="mother_phone"
                register={register}
                value={getValues("mother_phone")}
                onChange={(val) =>
                  setValue("mother_phone", val, { shouldDirty: true })
                }
                error={errors.mother_phone?.message}
              />
            </div>
          </div>
        )}

        {/* === الخطوة 4 === */}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-1">ملاحظات (اختياري)</label>
              <textarea
                className="w-full border rounded px-3 py-2"
                rows={4}
                {...register("notes")}
              />
            </div>
          </div>
        )}

        {/* أزرار الملاحة */}
        <div className="flex justify-between mt-6">
          {step > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              className="bg-gray-300 px-6 py-2 rounded hover:bg-gray-400"
            >
              السابق
            </button>
          ) : (
            <span />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={nextStep}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              التالي
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmit(onSubmit)} // الإرسال الوحيد المسموح
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-60"
            >
              {isSubmitting ? "جارِ الحفظ..." : "حفظ الطالب"}
            </button>
          )}
        </div>
      </form>

      {/* مودال التأكيد */}
      {confirmOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-5 w-full max-w-md shadow-lg">
            <h3 className="text-lg font-semibold mb-3">عائلة موجودة</h3>
            <p className="text-sm text-gray-700 mb-6">
              تم العثور على عائلة موجودة بنفس بيانات الأب والأم. هل ترغب في ربط
              الطالب بهذه العائلة؟
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleConfirmNo}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
              >
                لا
              </button>
              <button
                onClick={handleConfirmYes}
                className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
              >
                نعم
              </button>
            </div>
          </div>
        </div>
      )}

      {/* حالات التحميل */}
      <div className="mt-4 text-sm text-gray-500">
        {instBranchesStatus === "loading" && "جاري تحميل فروع المعهد... "}
        {academicBranchesStatus === "loading" &&
          "جاري تحميل الفروع الدراسية... "}
        {busesStatus === "loading" && "جاري تحميل الباصات... "}
        {statusesStatus === "loading" && "جاري تحميل الحالات... "}
        {citiesStatus === "loading" && "جاري تحميل المدن... "}
      </div>
    </div>
  );
}
