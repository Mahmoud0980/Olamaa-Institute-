"use client";

import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import ActionsRow from "@/components/common/ActionsRow";
import PrintButton from "@/components/common/PrintButton";
import ExcelButton from "@/components/common/ExcelButton";

import TeachersTable from "./components/TeachersTable";
import CoursesTable from "./components/CoursesTable";

import AddTeacherModal from "./components/steps/AddTeacherModal";
import EditTeacherModal from "./components/EditTeacherModal";
import EditTeacherPhotoModal from "./components/EditTeacherPhotoModal";
import EditTeacherSubjectsModal from "./components/EditTeacherSubjectsModal";
import EditTeacherBatchesModal from "./components/EditTeacherBatchesModal";

import {
  useGetTeachersQuery,
  useLazyGetTeacherBatchesDetailsQuery,
} from "@/store/services/teachersApi";
import TeachersPageSkeleton from "./components/TeachersPageSkeleton";
import { useGetSubjectsQuery } from "@/store/services/subjectsApi";

export default function TeachersPage() {
  const [openMenuId, setOpenMenuId] = useState(null);

  const { data, isLoading } = useGetTeachersQuery();
  const teachers = data?.data || [];

  // ✅ search + branch filter (من Navbar)
  const search = useSelector((state) => state.search?.values?.teachers) || "";
  const branchId = useSelector((state) => state.search?.values?.branch) || ""; // ✅ جديد

  const { data: subjectsData } = useGetSubjectsQuery();
  const subjects = subjectsData || [];
  const searchParams = useSearchParams();
  const router = useRouter();
  // ✅ فلترة: بحث + فرع
  const filteredTeachers = useMemo(() => {
    const s = (search || "").toLowerCase();

    return teachers
      .filter((t) => (t.name || "").toLowerCase().includes(s))
      .filter((t) => {
        if (!branchId) return true; // كل الفروع
        const tBranchId = t?.institute_branch?.id ?? t?.institute_branch_id;
        return String(tBranchId) === String(branchId);
      });
  }, [teachers, search, branchId]);

  // ✅ selection (multi)
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  const isAllSelected =
    filteredTeachers.length > 0 &&
    selectedIds.length > 0 &&
    selectedIds.length === filteredTeachers.length;

  const toggleSelectAll = () => {
    setSelectedIds(isAllSelected ? [] : filteredTeachers.map((t) => t.id));
  };
  useEffect(() => {
    const shouldOpen = searchParams.get("addTeacher") === "1";

    if (shouldOpen) {
      setAddOpen(true);

      // ✅ نشيل query من الرابط بعد الفتح حتى ما يفتح كل مرة Refresh
      router.replace("/teachers");
    }
  }, [searchParams, router]);
  // ✅ فضّي التحديد عند تغيير البحث أو الفرع (مثل منطق الفروع)
  useEffect(() => {
    setSelectedIds([]);
  }, [search, branchId]);

  // modals
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [photoOpen, setPhotoOpen] = useState(false);

  const [subjectsOpen, setSubjectsOpen] = useState(false);
  const [batchesOpen, setBatchesOpen] = useState(false);

  const [activeTeacher, setActiveTeacher] = useState(null);

  const handleBackFromDetails = () => {
    setSelectedTeacher(null);
    setOpenMenuId(null);
  };

  // ✅ Lazy query to fetch details (all) for each teacher when printing/exporting
  const [fetchTeacherDetails] = useLazyGetTeacherBatchesDetailsQuery();

  const normalizeArray = (res) => {
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res)) return res;
    return [];
  };

  const esc = (v) =>
    String(v ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const getTeacherAllRows = async (teacherId) => {
    const res = await fetchTeacherDetails(
      { id: teacherId, type: "all" },
      true
    ).unwrap();
    return normalizeArray(res);
  };

  // ===== Print =====
  const handlePrint = async () => {
    const idsToPrint = selectedTeacher ? [selectedTeacher.id] : selectedIds;

    if (idsToPrint.length === 0) {
      toast.error("يرجى تحديد مدرس واحد على الأقل للطباعة");
      return;
    }

    try {
      const teachersMap = new Map(teachers.map((t) => [t.id, t]));

      const detailsList = [];
      for (const id of idsToPrint) {
        const t = teachersMap.get(id);
        const allRows = await getTeacherAllRows(id);
        detailsList.push({ teacher: t, allRows });
      }

      const html = `
        <html dir="rtl">
          <head>
            <meta charset="UTF-8" />
            <style>
              body { font-family: Arial; padding: 12px; }
              h2 { margin: 0 0 8px; }
              h3 { margin: 18px 0 8px; }
              .card { border: 1px solid #ddd; border-radius: 10px; padding: 10px; margin-bottom: 14px; }
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid #ccc; padding: 6px; font-size: 12px; text-align: right; vertical-align: top; }
              th { background: #f3f3f3; }
              .muted { color: #666; font-size: 12px; }
              .summary { margin-top: 6px; }
            </style>
          </head>
          <body>
            <h2>طباعة بيانات المدرسين</h2>
            <div class="muted">عدد المدرسين: ${idsToPrint.length}</div>

            ${detailsList
              .map(({ teacher: t, allRows }, idx) => {
                const teacherName = t?.name || "—";
                const branch = t?.institute_branch?.name || "—";
                const specialization = t?.specialization || "—";
                const phone = t?.phone || "—";
                const hireDate = t?.hire_date || "—";

                const subjectsSet = new Set();
                const roomsSet = new Set();

                for (const b of allRows) {
                  if (b?.class_room?.name) roomsSet.add(b.class_room.name);
                  for (const s of b?.subjects || []) {
                    if (s?.subject_name) subjectsSet.add(s.subject_name);
                  }
                }

                const subjectsText = subjectsSet.size
                  ? Array.from(subjectsSet).join("، ")
                  : "—";
                const roomsText = roomsSet.size
                  ? Array.from(roomsSet).join("، ")
                  : "—";

                const batchesTable = allRows.length
                  ? `
                    <table>
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>الشعبة</th>
                          <th>القاعة</th>
                          <th>المواد</th>
                          <th>الفترة</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${allRows
                          .map((b, i) => {
                            const batchName = b?.batch_name || b?.name || "—";
                            const room = b?.class_room?.name || "—";
                            const subs =
                              b?.subjects?.length > 0
                                ? b.subjects
                                    .map((x) => x.subject_name)
                                    .join("، ")
                                : "—";
                            const period = `${b?.start_date || "—"} → ${
                              b?.end_date || "—"
                            }`;
                            return `
                              <tr>
                                <td>${i + 1}</td>
                                <td>${esc(batchName)}</td>
                                <td>${esc(room)}</td>
                                <td>${esc(subs)}</td>
                                <td>${esc(period)}</td>
                              </tr>
                            `;
                          })
                          .join("")}
                      </tbody>
                    </table>
                  `
                  : `<div class="muted">لا يوجد شعب/مواد/قاعات مرتبطة بهذا المدرس.</div>`;

                return `
                  <div class="card">
                    <h3>${idx + 1}) ${esc(teacherName)}</h3>
                    <div class="summary muted">
                      الفرع: ${esc(branch)} | الاختصاص: ${esc(
                  specialization
                )} | الهاتف: ${esc(phone)} | تاريخ التعيين: ${esc(hireDate)}
                    </div>
                    <div class="summary muted">
                      القاعات: ${esc(roomsText)}
                    </div>
                    <div class="summary muted">
                      المواد: ${esc(subjectsText)}
                    </div>
                    <div style="margin-top:10px;">
                      ${batchesTable}
                    </div>
                  </div>
                `;
              })
              .join("")}
          </body>
        </html>
      `;

      const win = window.open("", "", "width=1200,height=800");
      win.document.write(html);
      win.document.close();
      win.print();
    } catch (e) {
      toast.error(e?.data?.message || "فشل الطباعة");
    }
  };

  // ===== Excel =====
  const handleExcel = async () => {
    const idsToExport = selectedTeacher ? [selectedTeacher.id] : selectedIds;

    if (idsToExport.length === 0) {
      toast.error("يرجى تحديد مدرس واحد على الأقل للتصدير");
      return;
    }

    try {
      const teachersMap = new Map(teachers.map((t) => [t.id, t]));

      const detailRows = [];
      const summaryRows = [];

      for (const id of idsToExport) {
        const t = teachersMap.get(id);
        const allRows = await getTeacherAllRows(id);

        const subjectsSet = new Set();
        const roomsSet = new Set();

        for (const b of allRows) {
          if (b?.class_room?.name) roomsSet.add(b.class_room.name);
          for (const s of b?.subjects || []) {
            if (s?.subject_name) subjectsSet.add(s.subject_name);
          }

          const subsText =
            b?.subjects?.length > 0
              ? b.subjects.map((x) => x.subject_name).join("، ")
              : "";

          detailRows.push({
            "اسم المدرس": t?.name || "",
            الفرع: t?.institute_branch?.name || "",
            الاختصاص: t?.specialization || "",
            الهاتف: t?.phone || "",
            "تاريخ التعيين": t?.hire_date || "",
            الشعبة: b?.batch_name || b?.name || "",
            القاعة: b?.class_room?.name || "",
            المواد: subsText,
            من: b?.start_date || "",
            إلى: b?.end_date || "",
          });
        }

        if (allRows.length === 0) {
          detailRows.push({
            "اسم المدرس": t?.name || "",
            الفرع: t?.institute_branch?.name || "",
            الاختصاص: t?.specialization || "",
            الهاتف: t?.phone || "",
            "تاريخ التعيين": t?.hire_date || "",
            الشعبة: "",
            القاعة: "",
            المواد: "",
            من: "",
            إلى: "",
          });
        }

        summaryRows.push({
          "اسم المدرس": t?.name || "",
          الفرع: t?.institute_branch?.name || "",
          الاختصاص: t?.specialization || "",
          "عدد الشعب": allRows.length,
          "عدد القاعات": roomsSet.size,
          "عدد المواد": subjectsSet.size,
          القاعات: Array.from(roomsSet).join("، "),
          المواد: Array.from(subjectsSet).join("، "),
        });
      }

      const wb = XLSX.utils.book_new();

      const ws1 = XLSX.utils.json_to_sheet(summaryRows);
      XLSX.utils.book_append_sheet(wb, ws1, "Summary");

      const ws2 = XLSX.utils.json_to_sheet(detailRows);
      XLSX.utils.book_append_sheet(wb, ws2, "Details");

      const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });

      saveAs(
        new Blob([buffer], { type: "application/octet-stream" }),
        selectedTeacher
          ? `بيانات_${selectedTeacher?.name}.xlsx`
          : "قائمة_المدرسين.xlsx"
      );
    } catch (e) {
      toast.error(e?.data?.message || "فشل التصدير");
    }
  };

  if (isLoading) return <TeachersPageSkeleton />;

  return (
    <div dir="rtl" className="p-6 flex flex-col gap-6">
      {/* Actions */}
      <div className="flex justify-between items-center">
        <ActionsRow
          addLabel="إضافة أستاذ"
          onAdd={() => setAddOpen(true)}
          viewLabel=""
          showSelectAll={!selectedTeacher}
          isAllSelected={isAllSelected}
          onToggleSelectAll={toggleSelectAll}
          selectAllLabel="تحديد الكل"
        />
        <div className="flex gap-2">
          <PrintButton onClick={handlePrint} />
          <ExcelButton onClick={handleExcel} />
        </div>
      </div>

      {/* content */}
      <div className="w-full flex flex-col gap-6">
        {selectedTeacher ? (
          <CoursesTable
            selectedTeacher={selectedTeacher}
            onBack={handleBackFromDetails}
          />
        ) : (
          <TeachersTable
            teachers={filteredTeachers}
            selectedIds={selectedIds}
            onSelectChange={setSelectedIds}
            onSelectTeacher={setSelectedTeacher}
            onEdit={(t) => {
              setActiveTeacher(t);
              setEditOpen(true);
            }}
            onEditPhoto={(t) => {
              setActiveTeacher(t);
              setPhotoOpen(true);
            }}
            onEditSubjects={(t) => {
              setActiveTeacher(t);
              setSubjectsOpen(true);
            }}
            onEditBatches={(t) => {
              setActiveTeacher(t);
              setBatchesOpen(true);
            }}
            onDelete={(t) => console.log("DELETE", t)}
            openMenuId={openMenuId}
            setOpenMenuId={setOpenMenuId}
          />
        )}
      </div>

      {/* Modals */}
      <AddTeacherModal isOpen={addOpen} onClose={() => setAddOpen(false)} />

      <EditTeacherModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        teacher={activeTeacher}
      />

      <EditTeacherPhotoModal
        isOpen={photoOpen}
        onClose={() => setPhotoOpen(false)}
        teacher={activeTeacher}
      />

      <EditTeacherSubjectsModal
        isOpen={subjectsOpen}
        onClose={() => setSubjectsOpen(false)}
        teacher={activeTeacher}
        subjects={subjects}
      />

      <EditTeacherBatchesModal
        isOpen={batchesOpen}
        onClose={() => setBatchesOpen(false)}
        teacher={activeTeacher}
      />
    </div>
  );
}
