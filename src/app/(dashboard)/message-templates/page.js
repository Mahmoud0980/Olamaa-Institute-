"use client";

import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { notify } from "@/lib/helpers/toastify";

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
import Breadcrumb from "@/components/common/Breadcrumb";
import PageSkeleton from "@/components/common/PageSkeleton";
import PrintExportActions from "@/components/common/PrintExportActions";

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
    setSelectedIds(isAllSelected ? [] : filteredTemplates.map((t) => String(t.id)));
  };

  useEffect(() => {
    setSelectedIds([]);
  }, [search]);

  useEffect(() => {
    setSelectedIds((prev) => {
      const validIds = prev.filter((id) =>
        filteredTemplates.some((t) => String(t.id) === id),
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

  if (isLoading) {
    const tableHeaders = [
      "#",
      "اسم النموذج",
      "النوع",
      "الفئة",
      "الموضوع",
      "الحالة",
      "خيارات",
    ];
    return <PageSkeleton tableHeaders={tableHeaders} />;
  }

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
      setSelectedIds([]);
    } catch (err) {
      notify.error(err?.data?.message || "حدث خطأ أثناء الحذف");
    }
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
          <PrintExportActions 
            data={filteredTemplates}
            selectedIds={selectedIds}
            columns={[
              { header: "اسم النموذج", key: "name" },
              { header: "النوع", key: "type" },
              { header: "الفئة", key: "category" },
              { header: "الموضوع", key: "subject" },
              { 
                header: "الحالة", 
                key: "is_active",
                render: (val) => (val ? "نشط" : "غير نشط")
              },
            ]}
            title="نماذج الرسائل"
            filename="نماذج_الرسائل"
          />
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