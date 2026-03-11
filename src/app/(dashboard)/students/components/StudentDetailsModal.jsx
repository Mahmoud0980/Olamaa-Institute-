"use client";

import { useState } from "react";
import BaseModal from "@/components/common/BaseModal";
import PrintButton from "@/components/common/PrintButton";
import ExcelButton from "@/components/common/ExcelButton";
import { useGetStudentContactsSummaryQuery } from "@/store/services/contactsApi";
import {
  Phone,
  MessageSquare,
  MessageCircle,
  User,
  Users,
  Home,
  PhoneCall
} from "lucide-react";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

/* ================= helpers ================= */
const g = (x) => (x === "male" ? "ذكر" : x === "female" ? "أنثى" : "—");
const safe = (v) => (v === null || v === undefined || v === "" ? "—" : v);

/* ================= component ================= */
export default function StudentDetailsModal({
  open,
  onClose,
  student,
  isLoading = false,
}) {
  const [activeTab, setActiveTab] = useState("info"); // "info" | "contacts"

  const {
    data: contactsSummary,
    isFetching: loadingContacts
  } = useGetStudentContactsSummaryQuery(student?.id, {
    skip: !open || !student?.id || activeTab !== "contacts",
  });

  // ✅ عرض تحميل بدل "لا يوجد بيانات" أثناء التحميل
  const showLoading = open && (isLoading || !student);

  if (showLoading) {
    return (
      <BaseModal open={open} onClose={onClose} title="تفاصيل الطالب">
        <div className="py-14 flex flex-col items-center justify-center gap-3">
          <Spinner />
          <div className="text-sm text-gray-500">جاري تحميل البيانات...</div>
        </div>
      </BaseModal>
    );
  }

  // ✅ إذا انتهى التحميل وما في بيانات فعلاً
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
            <div class="card"><div class="label">المدرسة</div>${safe(
      student.school?.name
    )}</div>
          </div>

          <h3>العائلة</h3>
          <div class="grid">
            <div class="card"><div class="label">الأب</div>${father ? `${father.first_name} ${father.last_name}` : "—"
      }</div>
            <div class="card"><div class="label">الأم</div>${mother ? `${mother.first_name} ${mother.last_name}` : "—"
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
        المدرسة: student.school?.name,
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
          <div className="flex gap-2 mr-2">
            <PrintButton onClick={handlePrint} />
            <ExcelButton onClick={handleExcel} />
          </div>
        </div>
      }
    >
      <div className="flex flex-col h-full">
        {/* ===== Tabs Header ===== */}
        <div className="flex border-b border-gray-100 mb-6 gap-8">
          <TabButton
            active={activeTab === "info"}
            onClick={() => setActiveTab("info")}
            label="المعلومات العامة"
            icon={<User size={18} />}
          />
          <TabButton
            active={activeTab === "contacts"}
            onClick={() => setActiveTab("contacts")}
            label="جهات الاتصال"
            icon={<PhoneCall size={18} />}
          />
        </div>

        {/* ===== Tab Content ===== */}
        <div className="max-h-[65vh] overflow-y-auto pe-2 space-y-8 text-sm custom-scrollbar">
          {activeTab === "info" && (
            <>
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
                  <Card label="المدرسة" value={student.school?.name} />
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
                <div className="bg-white rounded-2xl p-4 text-gray-700 shadow-sm border border-gray-50">
                  {safe(student.notes)}
                </div>
              </Section>
            </>
          )}

          {activeTab === "contacts" && (
            <ContactsSummary
              data={contactsSummary}
              isLoading={loadingContacts}
            />
          )}
        </div>
      </div>
    </BaseModal>
  );
}

/* ================= UI PARTS ================= */

function TabButton({ active, onClick, label, icon }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 pb-3 px-1 border-b-2 transition-all duration-200 outline-none ${active
        ? "border-[#6F013F] text-[#6F013F] font-semibold"
        : "border-transparent text-gray-400 hover:text-gray-600"
        }`}
    >
      {icon}
      <span className="text-sm">{label}</span>
    </button>
  );
}

function ContactsSummary({ data, isLoading }) {
  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <Spinner />
        <p className="text-gray-400">جاري تحميل جهات الاتصال...</p>
      </div>
    );
  }

  const rawData = data?.data || data || {};
  const personal = rawData.personal_contacts || [];
  const family = rawData.family_contacts || [];
  const guardiansArr = rawData.guardians_contacts || [];

  const hasNoContacts =
    personal.length === 0 &&
    family.length === 0 &&
    guardiansArr.every(g => (g.details || []).length === 0 && !g.legacy_phone);

  if (hasNoContacts) {
    return (
      <div className="py-20 text-center text-gray-400">
        لا يوجد جهات اتصال مسجلة لهذا الطالب أو عائلته.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Student Personal Contacts */}
      {personal.length > 0 && (
        <ContactGroup
          title="الطالب (شخصي)"
          icon={<User size={16} />}
          items={personal}
        />
      )}

      {/* Guardians Contacts */}
      {guardiansArr.map((g, idx) => {
        const details = g.details || [];
        // If there's a legacy phone but no modern details, we might want to show it too
        // or just rely on details.
        if (details.length === 0 && !g.legacy_phone) return null;

        const relationshipTranslation = {
          father: "الأب",
          mother: "الأم",
        };

        return (
          <ContactGroup
            key={idx}
            title={`${relationshipTranslation[g.relationship] || g.relationship} — ${g.name}`}
            icon={<User size={16} />}
            items={details}
            legacyPhone={g.legacy_phone}
          />
        );
      })}

      {/* Family / Household Contacts */}
      {family.length > 0 && (
        <ContactGroup
          title="العائلة / المنزل"
          icon={<Home size={16} />}
          items={family}
        />
      )}
    </div>
  );
}

function ContactGroup({ title, icon, items, legacyPhone }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-[#6F013F] font-semibold">
        <div className="p-1.5 bg-[#fbeaf3] rounded-lg">
          {icon}
        </div>
        <span>{title}</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map((contact, cIdx) => (
          <ContactCard key={cIdx} contact={contact} />
        ))}
        {/* Fallback for legacy phone if no modern contact exists for this person */}
        {items.length === 0 && legacyPhone && (
          <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-4 flex items-center gap-3">
            <Phone size={16} className="text-gray-400" />
            <div>
              <span className="text-[10px] text-gray-400 block">رقم مسجل سابقاً</span>
              <span className="font-bold text-gray-600" dir="ltr">{legacyPhone}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ContactCard({ contact }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <div>
          <span className="text-xs font-medium text-gray-400 block mb-1">
            {contact.type === 'phone' ? 'هاتف محمول' : 'هاتف أرضي'}
            {contact.owner_name ? ` — ${contact.owner_name}` : ''}
          </span>
          <div className="flex items-center gap-2 text-lg font-bold text-gray-800" dir="ltr">
            <Phone size={16} className="text-gray-400" />
            <span>{contact.full_phone_number || contact.phone_number}</span>
          </div>
        </div>
        {contact.is_primary && (
          <span className="bg-green-50 text-green-600 text-[10px] px-2 py-0.5 rounded-full border border-green-100 font-medium">
            أساسي
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mt-3">
        {contact.supports_call && (
          <Badge icon={<PhoneCall size={10} />} label="اتصال" color="blue" />
        )}
        {contact.supports_whatsapp && (
          <Badge icon={<MessageCircle size={10} />} label="واتساب" color="green" />
        )}
        {contact.supports_sms && (
          <Badge icon={<MessageSquare size={10} />} label="رسائل" color="amber" />
        )}
      </div>

      {contact.notes && (
        <p className="mt-3 text-xs text-gray-500 bg-gray-50 p-2 rounded-lg border border-gray-100">
          {contact.notes}
        </p>
      )}
    </div>
  );
}

function Badge({ icon, label, color }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    green: "bg-green-50 text-green-600 border-green-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
  };

  return (
    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg border text-[10px] font-medium ${colors[color]}`}>
      {icon}
      <span>{label}</span>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h3 className="font-semibold text-[#6F013F] mb-3">{title}</h3>
      {children}
    </div>
  );
}

function Grid({ children, cols = 2 }) {
  const colsClass =
    cols === 3
      ? "md:grid-cols-3"
      : cols === 4
        ? "md:grid-cols-4"
        : "md:grid-cols-2";

  return (
    <div className={`grid grid-cols-1 ${colsClass} gap-4`}>{children}</div>
  );
}

function Card({ label, value }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="font-medium">{safe(value)}</div>
    </div>
  );
}

function Spinner() {
  return (
    <div className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-[#6F013F] animate-spin" />
  );
}
