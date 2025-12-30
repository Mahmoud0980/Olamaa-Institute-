"use client";

function getPrimaryPhone(student) {
  const guardians = student?.family?.guardians || [];
  const details = guardians.flatMap((g) => g.contact_details || []);

  const primaryPhone = details.find(
    (c) => c.type === "phone" && c.is_primary && c.full_phone_number
  );
  if (primaryPhone) return primaryPhone.full_phone_number;

  const anyPrimary = details.find(
    (c) => c.is_primary && (c.full_phone_number || c.value)
  );

  return anyPrimary?.full_phone_number || anyPrimary?.value || "—";
}

export default function StudentInfoTab({ student }) {
  const guardians = student?.family?.guardians || [];

  const father = guardians.find(
    (g) => g.relationship?.toLowerCase() === "father"
  );

  const mother = guardians.find(
    (g) => g.relationship?.toLowerCase() === "mother"
  );

  const items = [
    { label: "اسم الطالب:", value: student?.full_name || "—" },
    { label: "اسم الأب:", value: father?.first_name || "—" },
    { label: "اسم الأم:", value: mother?.first_name || "—" },
    { label: "هاتف ولي الأمر:", value: getPrimaryPhone(student) },
    { label: "الفرع:", value: student?.institute_branch?.name || "—" },
    { label: "الشعبة:", value: student?.batch?.name || "—" },
    { label: "تاريخ التسجيل:", value: student?.enrollment_date || "—" },
  ];

  return (
    <div className="bg-white rounded-2xl p-4 md:p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2 pb-10">
            <span className="text-sm text-gray-500 whitespace-nowrap">
              {item.label}
            </span>
            <span className="text-sm font-semibold text-gray-800 truncate">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
