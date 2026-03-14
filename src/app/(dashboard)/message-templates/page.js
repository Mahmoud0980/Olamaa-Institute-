"use client";

import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { notify } from "@/lib/helpers/toastify";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// ===== APIs =====
import {
  useGetMessageTemplatesQuery,
  useDeleteMessageTemplateMutation,
} from "@/store/services/messageTemplatesApi";

// ===== Components =====
import MessageTemplatesTable from "./components/MessageTemplatesTable";
import AddMessageTemplateModal from "./components/AddMessageTemplateModal";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import ActionsRow from "@/components/common/ActionsRow";
import PrintButton from "@/components/common/PrintButton";
import ExcelButton from "@/components/common/ExcelButton";
import Breadcrumb from "@/components/common/Breadcrumb";

export default function MessageTemplatesPage() {
  // ===== Redux (بحث) =====
  const search = useSelector(
    (state) => state.search.values.messageTemplates || "",
  );

  // ===== Data =====
  const { data, isLoading } = useGetMessageTemplatesQuery();
  const templates = data?.data || [];

  const [deleteTemplate, { isLoading: isDeleting }] =
    useDeleteMessageTemplateMutation();

  const getStatusLabel = (t) => (t?.is_active ? "نشط" : "غير نشط");

  // ===== Filtering =====
  const filteredTemplates = useMemo(() => {
    return templates.filter((t) => {
      const matchSearch =
        (t?.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (t?.subject || "").toLowerCase().includes(search.toLowerCase());

      return matchSearch;
    });
  }, [templates, search]);

  // ===== Selection =====
  const [selectedIds, setSelectedIds] = useState([]);

  const isAllSelected =
    filteredTemplates.length > 0 &&
    selectedIds.length === filteredTemplates.length;

  const toggleSelectAll = () => {
    setSelectedIds(isAllSelected ? [] : filteredTemplates.map((t) => t.id));
  };

  useEffect(() => {
    setSelectedIds([]);
  }, [search]);

  useEffect(() => {
    setSelectedIds((prev) => {
      const validIds = prev.filter((id) =>
        filteredTemplates.some((t) => t.id === id),
      );
      if (validIds.length === prev.length) return prev;
      return validIds;
    });
  }, [filteredTemplates]);

  // ===== Modals =====
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);

  // ===== Actions =====
  const handleEdit = (template) => {
    setSelectedTemplate(template || null);
    setIsModalOpen(true);
  };

  const handleDelete = (template) => {
    setTemplateToDelete(template);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!templateToDelete) return;

    try {
      await deleteTemplate(templateToDelete.id).unwrap();
      notify.success("تم حذف النموذج بنجاح");
      setIsDeleteOpen(false);
      setTemplateToDelete(null);
      setSelectedIds((prev) => prev.filter((id) => id !== templateToDelete.id));
    } catch (err) {
      notify.error(err?.data?.message || "حدث خطأ أثناء الحذف");
    }
  };

  // ===== Print =====
  const handlePrint = () => {
    if (selectedIds.length === 0) {
      notify.error("يرجى تحديد نموذج واحد على الأقل للطباعة");
      return;
    }

    const rows = filteredTemplates.filter((t) => selectedIds.includes(t.id));

    const html = `
      <html dir="rtl">
        <head>
          <style>
            body { font-family: Arial; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ccc; padding: 6px; font-size: 12px; text-align: right; }
            th { background: #f3f3f3; }
          </style>
        </head>
        <body>
          <h3>قائمة نماذج الرسائل</h3>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>اسم النموذج</th>
                <th>النوع</th>
                <th>الفئة</th>
                <th>الموضوع</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              ${rows
                .map(
                  (t, i) => `
                  <tr>
                    <td>${i + 1}</td>
                    <td>${t.name ?? "-"}</td>
                    <td>${t.type ?? "-"}</td>
                    <td>${t.category ?? "-"}</td>
                    <td>${t.subject ?? "-"}</td>
                    <td>${getStatusLabel(t)}</td>
                  </tr>
                `,
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const win = window.open("", "", "width=1200,height=800");
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.print();
  };

  // ===== Excel =====
  const handleExcel = () => {
    if (selectedIds.length === 0) {
      notify.error("يرجى تحديد نموذج واحد على الأقل للتصدير");
      return;
    }

    const rows = filteredTemplates.filter((t) => selectedIds.includes(t.id));

    const excelRows = rows.map((t) => ({
      "اسم النموذج": t.name ?? "-",
      النوع: t.type ?? "-",
      الفئة: t.category ?? "-",
      الموضوع: t.subject ?? "-",
      الحالة: getStatusLabel(t),
    }));

    const ws = XLSX.utils.json_to_sheet(excelRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "MessageTemplates");
    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([buffer], { type: "application/octet-stream" }),
      "نماذج_الرسائل.xlsx",
    );
  };

  return (
    <div dir="rtl" className="w-full h-full p-6 flex flex-col gap-6">
      <div className="w-full flex justify-between items-center">
        <div className="flex flex-col text-right">
          <h1 className="text-lg font-semibold text-gray-700">نماذج الرسائل</h1>
          <Breadcrumb />
        </div>
      </div>

      <div className="flex justify-between items-center">
        <ActionsRow
          addLabel="إضافة نموذج"
          showSelectAll
          isAllSelected={isAllSelected}
          onToggleSelectAll={toggleSelectAll}
          onAdd={() => {
            setSelectedTemplate(null);
            setIsModalOpen(true);
          }}
        />

        <div className="flex gap-2">
          <PrintButton onClick={handlePrint} />
          <ExcelButton onClick={handleExcel} />
        </div>
      </div>

      <MessageTemplatesTable
        templates={filteredTemplates}
        isLoading={isLoading}
        selectedIds={selectedIds}
        onSelectChange={setSelectedIds}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <AddMessageTemplateModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTemplate(null);
        }}
        template={selectedTemplate}
      />

      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        loading={isDeleting}
        title="حذف نموذج رسالة"
        description={`هل أنت متأكد من حذف النموذج ${templateToDelete?.name || ""}؟`}
        onClose={() => {
          setIsDeleteOpen(false);
          setTemplateToDelete(null);
        }}
        onConfirm={confirmDelete}
      />
    </div>
  );
}