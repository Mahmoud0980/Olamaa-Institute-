"use client";

import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import {
  useGetSchoolsQuery,
  useDeleteSchoolMutation,
} from "@/store/services/schoolsApi";

import SchoolsTable from "./components/SchoolsTable";
import AddSchoolModal from "./components/AddSchoolModal";

import ActionsRow from "@/components/common/ActionsRow";
import PrintButton from "@/components/common/PrintButton";
import ExcelButton from "@/components/common/ExcelButton";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import Breadcrumb from "@/components/common/Breadcrumb";

const typeLabel = (t) => {
  if (t === "public") return "حكومية";
  if (t === "private") return "خاصة";
  return t ?? "-";
};

const statusLabel = (v) => (v ? "مفعلة" : "متوقفة");

export default function SchoolsPage() {
  // ===== بحث من Navbar =====
  const search = useSelector((state) => state.search?.values?.schools || "");

  // ===== Data =====
  const { data, isLoading } = useGetSchoolsQuery();
  const schools = data?.data || [];

  const [deleteSchool, { isLoading: isDeleting }] = useDeleteSchoolMutation();

  // ===== Filtering =====
  const filteredSchools = useMemo(() => {
    const q = (search || "").toLowerCase().trim();
    if (!q) return schools;

    return schools.filter((row) => {
      const name = (row?.name ?? "").toLowerCase();
      const city = (row?.city ?? "").toLowerCase();
      const notes = (row?.notes ?? "").toLowerCase();
      const type = (row?.type ?? "").toLowerCase();
      return (
        name.includes(q) ||
        city.includes(q) ||
        notes.includes(q) ||
        type.includes(q)
      );
    });
  }, [schools, search]);

  // ===== Selection =====
  const [selectedIds, setSelectedIds] = useState([]);

  const isAllSelected =
    selectedIds.length > 0 && selectedIds.length === filteredSchools.length;

  const toggleSelectAll = () => {
    setSelectedIds(isAllSelected ? [] : filteredSchools.map((r) => r.id));
  };

  // تفريغ التحديد عند تغير البحث
  useEffect(() => {
    setSelectedIds([]);
  }, [search]);

  // تنظيف التحديد إذا انحذفت عناصر أو تغيرت الداتا (بدون infinite loop)
  useEffect(() => {
    setSelectedIds((prev) => {
      const validIds = prev.filter((id) =>
        filteredSchools.some((r) => r.id === id)
      );
      if (validIds.length === prev.length) return prev;
      return validIds;
    });
  }, [filteredSchools]);

  // ===== Modals =====
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [schoolToDelete, setSchoolToDelete] = useState(null);

  // ===== Actions =====
  const handleEdit = (id) => {
    setSelectedSchool(filteredSchools.find((r) => r.id === id) || null);
    setIsModalOpen(true);
  };

  const handleDelete = (row) => {
    setSchoolToDelete(row);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!schoolToDelete) return;

    try {
      await deleteSchool(schoolToDelete.id).unwrap();
      toast.success("تم حذف المدرسة بنجاح");
      setIsDeleteOpen(false);
      setSchoolToDelete(null);
      setSelectedIds([]);
    } catch (err) {
      toast.error(err?.data?.message || "حدث خطأ أثناء الحذف");
    }
  };

  // ===== Print (شرط: لازم تحديد) =====
  const handlePrint = () => {
    if (selectedIds.length === 0) {
      toast.error("يرجى تحديد مدرسة واحدة على الأقل للطباعة");
      return;
    }

    const rows = filteredSchools.filter((r) => selectedIds.includes(r.id));
    if (!rows.length) {
      toast.error("لا توجد بيانات للطباعة");
      return;
    }

    const html = `
      <html dir="rtl">
        <head>
          <meta charset="utf-8" />
          <style>
            body { font-family: Arial; padding: 16px; }
            table { width: 100%; border-collapse: collapse; }
            th, td {
              border: 1px solid #ccc;
              padding: 6px;
              font-size: 12px;
              text-align: right;
              vertical-align: top;
            }
            th { background: #f3f3f3; }
            h3 { margin: 0 0 12px; }
          </style>
        </head>
        <body>
          <h3>قائمة المدارس</h3>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>اسم المدرسة</th>
                <th>النوع</th>
                <th>المدينة</th>
                <th>الملاحظات</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              ${rows
                .map(
                  (r, i) => `
                    <tr>
                      <td>${i + 1}</td>
                      <td>${r?.name ?? "-"}</td>
                      <td>${typeLabel(r?.type)}</td>
                      <td>${r?.city ?? "-"}</td>
                      <td>${r?.notes ?? "-"}</td>
                      <td>${statusLabel(!!r?.is_active)}</td>
                    </tr>
                  `
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const win = window.open("", "", "width=1200,height=800");
    if (!win) {
      toast.error("المتصفح منع نافذة الطباعة");
      return;
    }

    win.document.write(html);
    win.document.close();
    win.print();
  };

  // ===== Excel (شرط: لازم تحديد) =====
  const handleExcel = () => {
    if (selectedIds.length === 0) {
      toast.error("يرجى تحديد مدرسة واحدة على الأقل للتصدير");
      return;
    }

    const rows = filteredSchools.filter((r) => selectedIds.includes(r.id));
    if (!rows.length) {
      toast.error("لا توجد بيانات للتصدير");
      return;
    }

    const excelRows = rows.map((r) => ({
      "اسم المدرسة": r?.name ?? "-",
      النوع: typeLabel(r?.type),
      المدينة: r?.city ?? "-",
      الملاحظات: r?.notes ?? "-",
      الحالة: statusLabel(!!r?.is_active),
    }));

    const ws = XLSX.utils.json_to_sheet(excelRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Schools");

    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });

    saveAs(
      new Blob([buffer], { type: "application/octet-stream" }),
      "قائمة_المدارس.xlsx"
    );
  };

  return (
    <div dir="rtl" className="w-full h-full p-6 flex flex-col gap-6">
      {/* HEADER */}
      <div className="w-full flex justify-between items-center">
        <div className="flex flex-col text-right">
          <h1 className="text-lg font-semibold text-gray-700">
            الجداول الرئيسية
          </h1>
          <Breadcrumb />
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex justify-between items-center flex-wrap gap-3">
        <ActionsRow
          addLabel="إضافة مدرسة"
          viewLabel=""
          showSelectAll
          isAllSelected={isAllSelected}
          onToggleSelectAll={toggleSelectAll}
          onAdd={() => {
            setSelectedSchool(null);
            setIsModalOpen(true);
          }}
        />

        <div className="flex gap-2">
          <PrintButton onClick={handlePrint} />
          <ExcelButton onClick={handleExcel} />
        </div>
      </div>

      {/* TABLE */}
      <SchoolsTable
        schools={filteredSchools}
        isLoading={isLoading}
        selectedIds={selectedIds}
        onSelectChange={setSelectedIds}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* MODALS */}
      <AddSchoolModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        school={selectedSchool}
      />

      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        loading={isDeleting}
        title="حذف مدرسة"
        description={`هل أنت متأكد من حذف المدرسة ${
          schoolToDelete?.name || ""
        }؟`}
        onClose={() => {
          setIsDeleteOpen(false);
          setSchoolToDelete(null);
        }}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
