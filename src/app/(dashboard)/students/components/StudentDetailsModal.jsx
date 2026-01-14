"use client";

import BaseModal from "@/components/common/BaseModal";
import PrintButton from "@/components/common/PrintButton";
import ExcelButton from "@/components/common/ExcelButton";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

/* ================= helpers ================= */
const g = (x) => (x === "male" ? "ذكر" : x === "female" ? "أنثى" : "—");
const safe = (v) => (v === null || v === undefined || v === "" ? "—" : v);

/* ================= component ================= */
export default function StudentDetailsModal({ open, onClose, student }) {
  if (!student) {
    return (
      <BaseModal open={open} onClose={onClose} title="تفاصيل الطالب">
        <div className="text-gray-400 text-center py-10">لا يوجد بيانات</div>
      </BaseModal>
    );
  }

  const father = student.family?.guardians?.find(
    (x) => x.relationship === "father"
  );
  const mother = student.family?.guardians?.find(
    (x) => x.relationship === "mother"
  );

  /* ================= PRINT ================= */
  const handlePrint = () => {
    const html = `
      <html dir="rtl">
        <head>
          <title>بيانات الطالب</title>
          <style>
            body { font-family: Arial; padding: 20px; }
            h2 { color: #6F013F; }
            h3 { margin-top: 24px; }
            .grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 12px;
            }
            .card {
              border: 1px solid #ddd;
              border-radius: 8px;
              padding: 10px;
            }
            .label {
              font-size: 12px;
              color: #666;
              margin-bottom: 4px;
            }
          </style>
        </head>
        <body>
          <h2> معلومات الطالب</h2>

          <h3>المعلومات الأساسية</h3>
          <div class="grid">
            <div class="card"><div class="label">الاسم</div>${safe(
              student.full_name
            )}</div>
            <div class="card"><div class="label">الجنس</div>${g(
              student.gender
            )}</div>
            <div class="card"><div class="label">تاريخ الميلاد</div>${safe(
              student.date_of_birth
            )}</div>
            <div class="card"><div class="label">مكان الولادة</div>${safe(
              student.birth_place
            )}</div>
          </div>

          <h3>التسجيل</h3>
          <div class="grid">
            <div class="card"><div class="label">تاريخ التسجيل</div>${safe(
              student.enrollment_date
            )}</div>
            <div class="card"><div class="label">بدء الحضور</div>${safe(
              student.start_attendance_date
            )}</div>
            <div class="card"><div class="label">الحالة</div>${safe(
              student.status?.name
            )}</div>
            <div class="card"><div class="label">الفرع</div>${safe(
              student.institute_branch?.name
            )}</div>
          </div>

          <h3>العائلة</h3>
          <div class="grid">
            <div class="card"><div class="label">الأب</div>${
              father ? `${father.first_name} ${father.last_name}` : "—"
            }</div>
            <div class="card"><div class="label">الأم</div>${
              mother ? `${mother.first_name} ${mother.last_name}` : "—"
            }</div>
          </div>

          <h3>العقد</h3>
          <div class="grid">
            <div class="card"><div class="label">الخصم %</div>${safe(
              student.enrollment_contract?.discount_percentage
            )}</div>
            <div class="card"><div class="label">الإجمالي $</div>${safe(
              student.enrollment_contract?.total_amount_usd
            )}</div>
            <div class="card"><div class="label">الصافي $</div>${safe(
              student.enrollment_contract?.final_amount_usd
            )}</div>
          </div>
        </body>
      </html>
    `;

    const win = window.open("", "", "width=1000,height=800");
    win.document.write(html);
    win.document.close();
    win.print();
  };

  /* ================= EXCEL ================= */
  const handleExcel = () => {
    const data = [
      {
        "الاسم الكامل": student.full_name,
        الجنس: g(student.gender),
        "تاريخ الميلاد": student.date_of_birth,
        "مكان الولادة": student.birth_place,
        "تاريخ التسجيل": student.enrollment_date,
        "بدء الحضور": student.start_attendance_date,
        الحالة: student.status?.name,
        الفرع: student.institute_branch?.name,
        الشعبة: student.branch?.name,
        المدينة: student.city?.name,
        الباص: student.bus?.name,
        "اسم الأب": father ? `${father.first_name} ${father.last_name}` : "—",
        "اسم الأم": mother ? `${mother.first_name} ${mother.last_name}` : "—",
        "الخصم %": student.enrollment_contract?.discount_percentage,
        "الإجمالي $": student.enrollment_contract?.total_amount_usd,
        "الصافي $": student.enrollment_contract?.final_amount_usd,
        ملاحظات: student.notes,
      },
    ];

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Student Report");

    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([buf], { type: "application/octet-stream" }),
      "معلومات الطالب.xlsx"
    );
  };

  /* ================= render ================= */
  return (
    <BaseModal
      open={open}
      onClose={onClose}
      widthClass="max-w-5xl"
      title={
        <div className="flex items-center justify-between w-full">
          <span>معلومات الطالب</span>
          <div className="flex gap-2">
            <PrintButton onClick={handlePrint} />
            <ExcelButton onClick={handleExcel} />
          </div>
        </div>
      }
    >
      {/* ===== scrollable content ===== */}
      <div className="max-h-[70vh] overflow-y-auto pe-2 space-y-8 text-sm">
        <Section title="المعلومات الأساسية">
          <Grid>
            <Card label="الاسم الكامل" value={student.full_name} />
            <Card label="الجنس" value={g(student.gender)} />
            <Card label="تاريخ الميلاد" value={student.date_of_birth} />
            <Card label="مكان الولادة" value={student.birth_place} />
            <Card label="الرقم الوطني" value={student.national_id} />
          </Grid>
        </Section>

        <Section title="التسجيل والدراسة">
          <Grid>
            <Card label="الفرع" value={student.institute_branch?.name} />
            <Card label="الشعبة" value={student.branch?.name} />
            <Card label="الدفعة" value={student.batch?.name} />
            <Card label="الحالة" value={student.status?.name} />
            <Card label="تاريخ التسجيل" value={student.enrollment_date} />
            <Card label="بدء الحضور" value={student.start_attendance_date} />
          </Grid>
        </Section>

        <Section title="العائلة">
          <Grid>
            <Card
              label="الأب"
              value={father ? `${father.first_name} ${father.last_name}` : "—"}
            />
            <Card
              label="الأم"
              value={mother ? `${mother.first_name} ${mother.last_name}` : "—"}
            />
          </Grid>
        </Section>

        <Section title="النقل">
          <Grid>
            <Card label="الباص" value={student.bus?.name} />
            <Card label="السائق" value={student.bus?.driver_name} />
          </Grid>
        </Section>

        <Section title="العقد المالي">
          <Grid cols={3}>
            <Card
              label="الخصم %"
              value={student.enrollment_contract?.discount_percentage}
            />
            <Card
              label="الإجمالي $"
              value={student.enrollment_contract?.total_amount_usd}
            />
            <Card
              label="الصافي $"
              value={student.enrollment_contract?.final_amount_usd}
            />
          </Grid>
        </Section>

        <Section title="ملاحظات">
          <div className="bg-white rounded-2xl p-4 text-gray-700">
            {safe(student.notes)}
          </div>
        </Section>
      </div>
    </BaseModal>
  );
}

/* ================= UI PARTS ================= */

function Section({ title, children }) {
  return (
    <div>
      <h3 className="font-semibold text-[#6F013F] mb-3">{title}</h3>
      {children}
    </div>
  );
}

function Grid({ children, cols = 2 }) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-${cols} gap-4`}>
      {children}
    </div>
  );
}

function Card({ label, value }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="font-medium">{safe(value)}</div>
    </div>
  );
}
