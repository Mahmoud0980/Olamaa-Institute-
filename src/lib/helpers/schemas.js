import { z } from "zod";
import { PhoneNumberUtil } from "google-libphonenumber";
import { phoneLengths } from "./phoneLengths";
const emptyToUndefined = (schema) =>
  z.preprocess((v) => (v === "" ? undefined : v), schema);

const optionalNonEmptyString = (msg) =>
  emptyToUndefined(z.string().nonempty(msg).optional());
const phoneUtil = PhoneNumberUtil.getInstance();
// إنشاء مخطط التحقق  فرع المعهد
export const instituteBranchSchema = z.object({
  name: z.string().nonempty("الاسم مطلوب").min(2, "الاسم قصير"),
  code: z.string().nonempty("الكود مطلوب").max(50, "الكود طويل"),
  address: z.string(),
  phone: z.string().regex(/^[0-9+\-()\s]+$/, "رقم هاتف غير صالح"),
  email: z.string().email("البريد الإلكتروني غير صالح").optional(),
  manager_name: z.string().optional(),
  is_active: z.boolean().default(true),
});
/*
____________________________________________
____________________________________________
____________________________________________
____________________________________________
*/
// إنشاء مخطط التحقق من رقم الهاتف مع التحقق من الصحة بناءً على الدولة
export const phoneSchema = (countryIso2) =>
  z.object({
    phone: z
      .string()
      .nonempty("رقم الهاتف مطلوب")
      .transform((val) => val.replace(/\D/g, ""))
      .refine((val) => {
        if (!val) return false; // إذا الحقل فارغ
        const maxLen = phoneLengths[countryIso2] || 20;
        try {
          const number = phoneUtil.parse(val, countryIso2);
          return (
            phoneUtil.isValidNumberForRegion(number, countryIso2) &&
            val.length <= maxLen
          );
        } catch {
          return false;
        }
      }, "رقم الهاتف غير صالح "),
  });
/*
____________________________________________
____________________________________________
____________________________________________
____________________________________________
*/
// إنشاء مخطط التحقق من المستخدم
// export const userSchema = z.object({
//   name: z.string().nonempty("الاسم").min(2, "الاسم قصير"),
//   password: z
//     .string()
//     .nonempty("كلمة المرور مطلوبة")
//     .min(6, "كلمة المرور قصيرة"),
//   role: z.enum(["admin", "staff", "student", "family"]),
//   is_approved: z.boolean().default(true),
//   force_password_change: z.boolean().default(false),
// });

/*
____________________________________________
____________________________________________
____________________________________________
____________________________________________
*/

/* ─────────────────────────────
   🔹 مساعدات بسيطة لإعادة الاستخدام
───────────────────────────── */
const optionalString = z
  .string()
  .trim()
  .optional()
  .transform((val) => (val === "" ? undefined : val));

const optionalNumber = z.preprocess(
  (v) => (v === "" ? undefined : Number(v)),
  z.number().int().optional()
);

const optionalDate = z
  .string()
  .optional()
  .refine((val) => !val || !isNaN(Date.parse(val)), {
    message: "التاريخ غير صالح",
  });

/* ─────────────────────────────
   👨‍🎓 مخطط بيانات الطالب
───────────────────────────── */
export const studentSchema = z.object({
  institute_branch_id: z.string().nonempty("يرجى اختيار فرع المعهد"),
  branch_id: z.string().nonempty("الفرع الدراسي للطالب مطلوب"),
  user_id: optionalNumber,

  first_name: z
    .string()
    .trim()
    .nonempty("يرجى إدخال الاسم")
    .min(2, "الاسم قصير جدًا"),
  last_name: z
    .string()
    .trim()
    .nonempty("يرجى إدخال الكنية")
    .min(2, "الكنية قصيرة جدًا"),

  date_of_birth: z
    .string()
    .nonempty("يرجى إدخال تاريخ الميلاد")
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "تاريخ الميلاد غير صالح",
    }),

  birth_place: optionalString,

  enrollment_date: z
    .string()
    .nonempty("تاريخ التسجيل مطلوب")
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "تاريخ التسجيل غير صالح",
    }),

  start_attendance_date: z
    .string()
    .nonempty("تاريخ بدء الحضور مطلوب")
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "تاريخ بدء الحضور غير صالح",
    }),

  gender: z.enum(["male", "female"]).optional(),

  national_id: optionalString,
  previous_school_name: optionalString,
  how_know_institute: optionalString,
  notes: optionalString,

  bus_id: optionalString,
  status_id: optionalString,
  city_id: optionalString,

  profile_photo: z
    .any()
    .optional()
    .refine((file) => !file || file.length <= 1, "يرجى اختيار صورة واحدة فقط"),

  id_card_photo: z
    .any()
    .optional()
    .refine((file) => !file || file.length <= 1, "يرجى اختيار صورة واحدة فقط"),
});

/* ─────────────────────────────
   👨‍👩‍👧 بيانات أولياء الأمور
───────────────────────────── */
export const guardiansSchema = z.object({
  father_first_name: z
    .string()
    .trim()
    .nonempty("اسم الأب مطلوب")
    .min(2, "اسم الأب قصير جدًا"),
  father_last_name: z
    .string()
    .trim()
    .nonempty("كنية الأب مطلوبة")
    .min(2, "كنية الأب قصيرة جدًا"),
  father_national_id: optionalString,
  father_occupation: optionalString,
  father_address: optionalString,

  mother_first_name: z
    .string()
    .trim()
    .nonempty("اسم الأم مطلوب")
    .min(2, "اسم الأم قصير جدًا"),
  mother_last_name: z
    .string()
    .trim()
    .nonempty("كنية الأم مطلوبة")
    .min(2, "كنية الأم قصيرة جدًا"),
  mother_national_id: optionalString,
  mother_occupation: optionalString,
  mother_address: optionalString,
});

/* ─────────────────────────────
   🧩 النموذج الكامل (التحقق النهائي)
───────────────────────────── */
export const studentFormSchema = studentSchema
  .merge(guardiansSchema)
  .refine(
    (data) =>
      !data.enrollment_date ||
      !data.start_attendance_date ||
      new Date(data.start_attendance_date) >= new Date(data.enrollment_date),
    {
      path: ["start_attendance_date"],
      message: "تاريخ بدء الحضور يجب أن يكون بعد أو يساوي تاريخ التسجيل",
    }
  );

/*
____________________________________________
____________________________________________
____________________________________________
____________________________________________
*/
export const recordSchema = z.object({
  //student_id: z.number().int(),
  record_type: z
    .string()
    .nonempty("يرجى ادخال الشهادة الاكادمية")
    .min(3, "نوع السجل غير صالح"),
  total_score: z.number().nonnegative().max(100),
  year: z
    .number()
    .int()
    .min(1900)
    .max(new Date().getFullYear() + 1),
  description: z.string().optional(),
});
/*
____________________________________________
____________________________________________
____________________________________________
____________________________________________
*/
// إنشاء مخطط التحقق من الباص
export const busSchema = z.object({
  name: z.string().nonempty("اسم الباص مطلوب").min(2, "اسم الباص قصير"),
  capacity: z.number().min(1, "السعة يجب أن تكون أكبر من 0"),
  driver_name: z
    .string()
    .nonempty("اسم السائق مطلوب")
    .min(2, "اسم السائق قصير"),
  route_description: z
    .string()
    .nonempty("يجب ادخال وصف المسار")
    .min(2, "وصف المسار قصير"),
  is_active: z.boolean().default(true),
});
//إنشاء مخطط تحقق من المدينة
export const CitySchema = z.object({
  name: z.string().nonempty("الاسم مطلوب").min(2, "الاسم قصير"),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
});

/*
____________________________________________
____________________________________________
____________________________________________
____________________________________________
*/
// إنشاء مخطط التحقق من الامتحان
export const examSchema = z.object({
  //batch_subject_id: z.number({ required_error: "الـ batch_subject_id مطلوب" }),
  name: z.string().nonempty("اسم الامتحان مطلوب").min(3, "الاسم قصير"),
  exam_date: z.string().nonempty("تاريخ الامتحان مطلوب"),
  total_marks: z.number().min(1, "العلامات الكلية يجب أن تكون أكبر من صفر"),
  passing_marks: z.number().min(1, "علامات النجاح يجب أن تكون أكبر من صفر"),
  status: z.enum(["scheduled", "ongoing", "completed"]),
  exam_type: z.enum(["midterm", "final", "quiz"]),
  remarks: z.string().optional(),
});
/*
____________________________________________
____________________________________________
____________________________________________
____________________________________________
*/
// إنشاء مخطط التحقق من ولي الأمر
export const guardianSchema = z.object({
  // family_id: z.number(),
  first_name: z.string().nonempty("الاسم الأول مطلوب").min(2, "الاسم قصير"),
  last_name: z.string().nonempty("اسم العائلة مطلوب").min(2, "الاسم قصير"),
  national_id: z
    .string()
    .nonempty("الرقم الوطني مطلوب")
    .regex(/^\d{9,14}$/, "رقم وطني غير صالح"),
  // phone: z
  //   .string()
  //   .nonempty("رقم الهاتف مطلوب")
  //   .regex(/^[0-9+\-()\s]+$/, "رقم هاتف غير صالح"),
  password: z.string().min(6, "كلمة المرور قصيرة").optional(),
  occupation: z.string().optional(),
  address: z.string().optional(),
  relationship: z.enum(["father", "mother", "guardian"]).optional(),
});

/*
____________________________________________
____________________________________________
____________________________________________
____________________________________________
*/
// إنشاء مخطط التحقق من المدرس
export const instructorSchema = z.object({
  user_id: z.number().int().positive("معرف المستخدم غير صالح"),
  name: z.string().nonempty("الاسم مطلوب").min(2, "الاسم قصير"),
  institute_branch_id: z.number().int().positive("الفرع غير صالح"),
  phone: z.string().regex(/^[0-9+\-()\s]+$/, "رقم هاتف غير صالح"),
  specialization: z.string().nonempty("التخصص مطلوب"),
  hire_date: z.string().nonempty("تاريخ التوظيف مطلوب"),
});
/*
____________________________________________
____________________________________________
____________________________________________
____________________________________________
*/
// إنشاء مخطط التحقق من قالب الرسالة
export const messageTemplateSchema = z.object({
  name: z.string().nonempty("الاسم مطلوب").min(2, "الاسم قصير"),
  type: z.enum(["sms", "email"], "نوع القالب غير صالح"),
  subject: z.string().nonempty("الموضوع مطلوب"),
  body: z.string().nonempty("نص الرسالة مطلوب"),
  is_active: z.boolean().default(true),
});
/*
____________________________________________
____________________________________________
____________________________________________
____________________________________________
*/
// إنشاء مخطط التحقق من الإشعار
export const notificationSchema = z.object({
  //template_id: z.number().int("معرّف القالب يجب أن يكون رقم صحيح"),
  title: z.string().nonempty("العنوان مطلوب").min(2, "العنوان قصير"),
  body: z.string().nonempty("نص الإشعار مطلوب"),
  type: z.enum(["sms", "email", "push"], "نوع الإشعار غير صالح"),
  target_type: z.enum(
    ["student", "guardian", "teacher"],
    "نوع المستهدف غير صالح"
  ),
  target_id: z.number().int("معرّف المستهدف يجب أن يكون رقم صحيح"),
  scheduled_at: z.string().optional(), // صيغة ISO
  sent_at: z.string().optional(),
  status: z.enum(["pending", "sent", "failed"]).default("pending"),
  attachment_url: z.string().url("رابط المرفق غير صالح").optional(),
});
/*
____________________________________________
____________________________________________
____________________________________________
____________________________________________
*/
// إنشاء مخطط التحقق من القسط
export const installmentSchema = z.object({
  //enrollment_contract_id: z.number().int().positive("رقم العقد غير صالح"),
  installment_number: z.number().int().positive("رقم القسط غير صالح"),
  due_date: z.string().nonempty("تاريخ الاستحقاق مطلوب"),
  planned_amount_usd: z
    .number()
    .positive("المبلغ بالدولار يجب أن يكون أكبر من صفر"),
  exchange_rate_at_due_date: z
    .number()
    .positive("سعر الصرف يجب أن يكون أكبر من صفر"),
  planned_amount_syp: z
    .number()
    .positive("المبلغ بالليرة يجب أن يكون أكبر من صفر"),
  status: z.enum(["pending", "paid", "overdue"]),
});
/*
____________________________________________
____________________________________________
____________________________________________
____________________________________________
*/
// إنشاء مخطط التحقق من الدفع
export const paymentSchema = z.object({
  receipt_number: z.string().nonempty("رقم الإيصال مطلوب"),
  institute_branch_id: z.number().int().positive("فرع المعهد غير صالح"),
  student_id: z.number().int().positive("الطالب غير صالح"),
  enrollment_contracts_id: z.number().int().positive("رقم العقد غير صالح"),
  payment_installments_id: z.number().int().positive("رقم القسط غير صالح"),
  amount_usd: z.number().positive("المبلغ بالدولار يجب أن يكون أكبر من صفر"),
  amount_syp: z.number().positive("المبلغ بالليرة يجب أن يكون أكبر من صفر"),
  exchange_rate_at_payment: z
    .number()
    .positive("سعر الصرف يجب أن يكون أكبر من صفر"),
  currency: z.enum(["USD", "SYP"], "عملة غير صالحة"),
  due_date: z.string().nonempty("تاريخ الاستحقاق مطلوب"),
  paid_date: z.string().nonempty("تاريخ الدفع مطلوب"),
  description: z.string().optional(),
});
/*
____________________________________________
____________________________________________
____________________________________________
____________________________________________
*/
// إنشاء مخطط التحقق من حالة الطالب
export const studentStatusSchema = z.object({
  name: z.string().nonempty("اسم الحالة مطلوب").min(2, "الاسم قصير"),
  code: z.string().nonempty("الكود مطلوب").max(50, "الكود طويل"),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
});
/*
____________________________________________
____________________________________________
____________________________________________
____________________________________________
*/
// إنشاء مخطط التحقق من المادة الدراسية
export const subjectSchema = z.object({
  name: z.string().nonempty("الاسم مطلوب").min(2, "الاسم قصير"),
  code: z.string().nonempty("الكود مطلوب").max(50, "الكود طويل"),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
});
/*
____________________________________________
____________________________________________
____________________________________________
____________________________________________
*/
// إنشاء مخطط التحقق من الحضور
export const attendanceSchema = z.object({
  //institute_branch_id: z.number().int().positive("الفرع مطلوب"),
  //student_id: z.number().int().positive("الطالب مطلوب"),
  //batch_id: z.number().int().positive("الدفعة مطلوبة"),
  attendance_date: z.string().nonempty("تاريخ الحضور مطلوب"),
  status: z.enum(["present", "absent", "late", "excused"], {
    errorMap: () => ({ message: "الحالة غير صحيحة" }),
  }),
  recorded_by: z.number().int().positive("المسجل مطلوب"),
  //device_id: z.string().nonempty("معرّف الجهاز مطلوب"),
  recorded_at: z.string().nonempty("تاريخ التسجيل مطلوب"),
});
/*
____________________________________________
____________________________________________
____________________________________________
____________________________________________
*/
//إنشاء مخطط تحقق من الجهاز
export const deviceSchema = z.object({
  device_id: z.string().nonempty("معرّف الجهاز مطلوب"),
  device_name: z.string().min(3, "اسم الجهاز قصير جدًا"),
  is_active: z.boolean().default(true),
});
/*
____________________________________________
____________________________________________
____________________________________________
____________________________________________
*/
// إنشاء مخطط التحقق من الشعبة
export const batchSchema = z.object({
  name: z.string().nonempty("اسم الشعبة مطلوب").min(3, "الاسم قصير جدًا"),
  institute_branch_id: z.string({ invalid_type_error: "اختر الفرع" }),

  academic_branch_id: z.string({ invalid_type_error: "اختر الفرع الأكاديمي" }),

  start_date: z.string().nonempty("تاريخ البداية مطلوب"),
  end_date: z.string().nonempty("تاريخ النهاية مطلوب"),
  is_archived: z.boolean().default(false),
  is_hidden: z.boolean().default(false),
  is_completed: z.boolean().default(false),
});
/*
____________________________________________
____________________________________________
____________________________________________
____________________________________________
*/
// إنشاء مخطط التحقق من الجدول
export const scheduleSchema = z.object({
  //batch_subject_id: z.number().min(1, "رقم المادة مطلوب"),
  day_of_week: z.string().nonempty("اليوم مطلوب"),
  schedule_date: z.string().nonempty("تاريخ الجدول مطلوب"),
  start_time: z.string().nonempty("وقت البداية مطلوب"),
  end_time: z.string().nonempty("وقت النهاية مطلوب"),
  room_number: z.string().nonempty("رقم القاعة مطلوب"),
  is_default: z.boolean().default(false),
  is_active: z.boolean().default(true),
  description: z.string().optional(),
});
/*
____________________________________________
____________________________________________
____________________________________________
____________________________________________
*/
// إنشاء مخطط التحقق من جهاز الباب
export const doorDeviceSchema = z.object({
  //device_id: z.string().nonempty("معرّف الجهاز مطلوب"),
  name: z.string().nonempty("اسم الجهاز مطلوب").min(3, "اسم الجهاز قصير"),
  location: z.string().nonempty("الموقع مطلوب"),
  is_active: z.boolean().default(true),
});

/*
____________________________________________
____________________________________________
____________________________________________
____________________________________________
*/
//إنشاء مخطط تحقق من جلسة الباب
export const doorSessionSchema = z.object({
  //device_id: z.number({ required_error: "معرف الجهاز مطلوب" }),
  session_token: z
    .string()
    .nonempty("رمز الجلسة مطلوب")
    .min(5, "رمز الجلسة قصير"),
  expires_at: z.string().nonempty("تاريخ الانتهاء مطلوب"),
  is_used: z.boolean().default(false),
  student_id: z.number().nonnegative("معرف الطالب مطلوب"),
  used_at: z.string().nullable().optional(),
});
/*
____________________________________________
____________________________________________
____________________________________________
____________________________________________
*/
//إنشاء مخطط تحقق من الموظف
export const employeeSchema = z.object({
  first_name: z.string().nonempty("الاسم الأول مطلوب").min(2, "قصير جدا"),
  last_name: z.string().nonempty("الاسم الأخير مطلوب").min(2, "قصير جدا"),
  job_title: z.string().nonempty("المسمى الوظيفي مطلوب"),
  job_type: z.enum(["supervisor", "teacher", "admin", "other"], {
    errorMap: () => ({ message: "نوع الوظيفة غير صالح" }),
  }),
  hire_date: z.string().nonempty("تاريخ التعيين مطلوب"),
  // phone: z
  //   .string()
  //   .regex(/^[0-9+\-()\s]+$/, "رقم هاتف غير صالح")
  //   .nonempty("رقم الهاتف مطلوب"),
  institute_branch_id: z.number().int("يجب أن يكون رقم صحيح"),
  is_active: z.boolean().default(true),
});
/*
____________________________________________
____________________________________________
____________________________________________
____________________________________________
*/
// إنشاء مخطط التحقق من نتيجة الامتحان
export const examResultSchema = z.object({
  // exam_id: z.number().int("معرّف الامتحان غير صالح"),
  // student_id: z.number().int("معرّف الطالب غير صالح"),
  obtained_marks: z
    .number()
    .min(0, "العلامة يجب أن تكون موجبة")
    .max(100, "العلامة لا تتجاوز 100"),
  is_passed: z.boolean(),
  remarks: z.string().optional(),
});
/*
____________________________________________
____________________________________________
____________________________________________
____________________________________________
*/
//لإنشاء مخطط التحقق من المدرس
export const teacherSchema = z.object({
  name: z.string().nonempty("الاسم مطلوب").min(2, "الاسم قصير"),
  phone: z.string().regex(/^[0-9+\-()\s]+$/, "رقم هاتف غير صالح"),
  specialization: z.string().nonempty("التخصص مطلوب"),
  hire_date: z.string().nonempty("تاريخ التوظيف مطلوب"),
  institute_branch_id: z.number().int("الفرع غير صالح"),
});
/*
____________________________________________
____________________________________________
____________________________________________
____________________________________________
*/
//إنشاء مخطط تحقق من الفرع الأكاديمي
export const academicBranchSchema = z.object({
  name: z.string().nonempty("الاسم مطلوب").min(2, "الاسم قصير"),
  code: z.string().nonempty("الكود مطلوب").max(50, "الكود طويل"),
  address: z.string().optional(),
  phone: z.string().regex(/^[0-9+\-()\s]+$/, "رقم هاتف غير صالح"),
  email: z.string().email("البريد الإلكتروني غير صالح").optional(),
  manager_name: z.string().optional(),
  is_active: z.boolean().default(true),
});
