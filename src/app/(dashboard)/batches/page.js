"use client";

import { useState, useMemo, useEffect } from "react";
import { useSelector } from "react-redux";

import { notify } from "@/lib/helpers/toastify";
import useDebounce from "@/lib/hooks/useDebounce";

// ===== APIs =====
import {
  useGetBatchesQuery,
  useGetBatchesStatsQuery,
  useDeleteBatchMutation,
} from "@/store/services/batchesApi";

// ===== Components =====
import BatchesTable from "./components/BatchesTable";
import AddBatchModal from "./components/AddBatchModal";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import DashboardButton from "@/components/common/DashboardButton";
import Breadcrumb from "@/components/common/Breadcrumb";
import { Users, BookOpen, Globe, Contact } from "lucide-react";
import PageSkeleton from "@/components/common/PageSkeleton";
import PrintExportActions from "@/components/common/PrintExportActions";

export default function BatchesPage() {
  // ===== Redux Filters =====
  const search = useSelector((state) => state.search.values.batches);
  const branchId = useSelector((state) => state.search.values.branch);

  // ===== State Filters =====
  const [page, setPage] = useState(1);
  const perPage = 10;
  
  const [nameSearch, setNameSearch] = useState("");
  const [studentNameSearch, setStudentNameSearch] = useState("");
  
  const debouncedNameSearch = useDebounce(nameSearch, 500);
  const debouncedStudentNameSearch = useDebounce(studentNameSearch, 500);

  const [includeHidden, setIncludeHidden] = useState(false);
  const [includeArchived, setIncludeArchived] = useState(false);

  // ===== Query Data =====
  const { data, isLoading } = useGetBatchesQuery({
    page,
    per_page: perPage,
    name: debouncedNameSearch || search || undefined,
    student_name: debouncedStudentNameSearch || undefined,
    institute_branch_id: branchId || undefined,
    include_hidden: includeHidden,
    include_archived: includeArchived,
  });

  const batches = data?.data?.batches || [];
  const pagination = data?.data?.pagination || { current_page: 1, last_page: 1, total: 0 };

  const { data: statsData } = useGetBatchesStatsQuery();
  const stats = statsData?.data || { completed: 0, not_completed: 0, archived: 0, hidden: 0, total: 0 };
  const firstBatch = batches[0] || {};

  const [deleteBatch, { isLoading: isDeleting }] = useDeleteBatchMutation();

  // ===== Helpers =====
  const getGenderLabel = (g) =>
    g === "male" ? "ذكور" : g === "female" ? "إناث" : "-";

  const getStatusLabel = (b) =>
    b.is_completed
      ? "مكتملة"
      : b.is_hidden
        ? "مخفية"
        : b.is_archived
          ? "مؤرشفة"
          : "نشطة";

  // ===== Selection =====
  const [selectedIds, setSelectedIds] = useState([]);

  const isAllSelected =
    batches.length > 0 && selectedIds.length === batches.length;

  const toggleSelectAll = () => {
    setSelectedIds(isAllSelected ? [] : batches.map((b) => String(b.id)));
  };

  useEffect(() => {
    setSelectedIds([]);
  }, [page, debouncedNameSearch, debouncedStudentNameSearch, search, branchId, includeHidden, includeArchived]);

  // تنظيف التحديد إذا انحذفت عناصر أو تغيرت الداتا
  useEffect(() => {
    setSelectedIds((prev) => {
      const validIds = prev.filter((id) =>
        batches.some((r) => String(r.id) === id),
      );
      if (validIds.length === prev.length) return prev;
      return validIds;
    });
  }, [batches]);

  // ===== Modals =====
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [batchToDelete, setBatchToDelete] = useState(null);

  // ===== Actions =====
  const handleEdit = (id) => {
    setSelectedBatch(batches.find((b) => String(b.id) === String(id)) || null);
    setIsModalOpen(true);
  };

  const handleDelete = (batch) => {
    setBatchToDelete(batch);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!batchToDelete) return;

    try {
      await deleteBatch(batchToDelete.id).unwrap();
      notify.success("تم حذف الشعبة بنجاح");
      setIsDeleteOpen(false);
      setBatchToDelete(null);
      setSelectedIds([]);
    } catch (err) {
      notify.error(err?.data?.message || "فشل حذف الشعبة");
    }
  };

  if (isLoading) {
    const tableHeaders = [
      "#",
      "اسم الشعبة",
      "الفرع",
      "الفرع الأكاديمي",
      "القاعة",
      "تاريخ البداية",
      "تاريخ النهاية",
      "الجنس",
      "الحالة",
      "الإجراءات",
    ];
    return <PageSkeleton tableHeaders={tableHeaders} />;
  }

  return (
    <div dir="rtl" className="w-full h-full p-6 flex flex-col gap-6">
      {/* 1. Header & Breadcrumb */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-800">الدورات</h1>
          <Breadcrumb />
        </div>
      </div>

      {/* 2. Advanced Filters */}
      <div className="flex flex-col md:flex-row gap-8 items-end w-full max-w-2xl bg-white p-2 rounded-xl">
        <div className="flex flex-col gap-2 w-full md:w-1/2">
          <label className="text-sm font-semibold text-gray-700">الدورة:</label>
          <div className="relative">
            <input
              type="text"
              placeholder="البحث باسم الدورة..."
              className="w-full bg-[#f9f9f9] border border-gray-200 p-2.5 rounded-xl outline-none focus:border-[#6F013F] text-sm"
              value={nameSearch}
              onChange={(e) => setNameSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 w-full md:w-1/2">
          <label className="text-sm font-semibold text-gray-700">اسم الطالب:</label>
          <div className="relative">
            <input
              type="text"
              placeholder="البحث باسم الطالب..."
              className="w-full bg-[#f9f9f9] border border-gray-200 p-2.5 rounded-xl outline-none focus:border-[#6F013F] text-sm"
              value={studentNameSearch}
              onChange={(e) => setStudentNameSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* 3. Action Buttons */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-gray-200 pb-4">
        <div className="flex gap-2">
          <PrintExportActions 
            data={batches}
            selectedIds={selectedIds}
            columns={[
              { header: "اسم الشعبة", key: "name" },
              { 
                header: "الجنس", 
                key: "gender_type",
                render: getGenderLabel
              },
              { 
                header: "الفرع", 
                key: "institute_branch",
                render: (val) => val?.name || "-"
              },
              { 
                header: "الفرع الأكاديمي", 
                key: "academic_branch",
                render: (val) => val?.name || "-"
              },
              { 
                header: "القاعة", 
                key: "class_room",
                render: (val) => val?.name || "-"
              },
              { header: "البداية", key: "start_date" },
              { header: "النهاية", key: "end_date" },
              { 
                header: "الحالة", 
                key: "id", // any key, we use row in render
                render: (_, row) => getStatusLabel(row)
              },
            ]}
            title="قائمة الشعب"
            filename="الشعب"
          />
        </div>

        <div className="flex gap-2 flex-wrap items-center">
          <button
            onClick={() => setIncludeArchived(!includeArchived)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
              includeArchived ? 'bg-blue-200 text-blue-900 border border-blue-300' : 'bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100'
            }`}
          >
            <img src="/icons/archive.svg" alt="أرشفة" width={16} height={16} className="opacity-70" />
            عرض الدورات المؤرشفة
          </button>
          
          <button
            onClick={() => setIncludeHidden(!includeHidden)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
              includeHidden ? 'bg-green-200 text-green-900 border border-green-300' : 'bg-green-50 text-green-700 border border-green-100 hover:bg-green-100'
            }`}
          >
            <img src="/icons/hidden.svg" alt="إخفاء" width={16} height={16} className="opacity-70" />
            عرض الدورات المخفية
          </button>

          <DashboardButton
            label="تحديد الكل"
            icon={<input type="checkbox" checked={isAllSelected} readOnly className="accent-[#8A1654] w-4 h-4 cursor-pointer" />}
            color="gray"
            className="rounded-lg shadow-sm border border-gray-100 h-[38px]"
            onClick={toggleSelectAll}
          />
          
          <DashboardButton
            label="إضافة دورة"
            icon={<span className="text-lg leading-none">+</span>}
            color="pink"
            className="rounded-lg shadow-sm font-medium h-[38px] bg-[#FFF2F8] text-[#8A1654] border border-[#FBE3EE] hover:bg-[#FBE3EE]"
            onClick={() => {
              setSelectedBatch(null);
              setIsModalOpen(true);
            }}
          />
        </div>
      </div>

      {/* 4. Stats Cards Layer */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex flex-col gap-4 w-full md:w-1/4">
          <div className="bg-white border text-center border-gray-200 p-6 rounded-2xl flex items-center justify-between shadow-sm cursor-default">
             <div className="font-bold text-gray-800 flex items-center gap-2">
                 <Globe className="text-[#03A3A3]" size={20} /> الدورة مكتملة 
                 <span className="text-sm bg-gray-100 px-2 py-0.5 rounded-full">{stats.completed || 0}</span>
             </div>
          </div>
          <div className="bg-white border text-center border-gray-200 p-6 rounded-2xl flex items-center justify-between shadow-sm cursor-default">
             <div className="font-bold text-gray-800 flex items-center gap-2">
                <Contact className="text-[#F294C6]" size={20} /> {firstBatch?.employees_count || 0} مدرس
             </div>
          </div>
        </div>

        <div className="flex gap-4 w-full md:w-3/4 flex-col md:flex-row">
          <div className="bg-[#FAF5FD] border border-[#F0E6F6] p-6 rounded-2xl flex-1 flex flex-col justify-between shadow-sm relative overflow-hidden">
             <div className="flex justify-between items-start mb-6">
                <div>
                   <h3 className="text-xl font-bold text-gray-800 mb-1">مواد الدورة</h3>
                   <p className="text-sm text-gray-500 max-w-[200px]">عرض المواد الدراسية الخاصة بهذه الدورة</p>
                </div>
                <div className="bg-[#8A1654] text-white p-3 rounded-2xl">
                   <BookOpen size={24} />
                </div>
             </div>
             <div className="flex items-end justify-between">
                <div className="bg-[#8A1654] w-10 h-10 rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-[#6e1143] transition">
                    <span className="text-xl leading-none">↗</span>
                </div>
                <h2 className="text-4xl font-bold text-gray-800">{firstBatch?.subjects_count || 0}</h2>
             </div>
          </div>

          <div className="bg-[#FAF5FD] border border-[#F0E6F6] p-6 rounded-2xl flex-1 flex flex-col justify-between shadow-sm relative overflow-hidden">
             <div className="flex justify-between items-start mb-6">
                <div>
                   <h3 className="text-xl font-bold text-gray-800 mb-1">طلاب الدورة</h3>
                   <p className="text-sm text-gray-500 max-w-[200px]">عرض الطلاب الذين ينتموا بهذه الدورة</p>
                </div>
                <div className="bg-[#8A1654] text-white p-3 rounded-2xl">
                   <Users size={24} />
                </div>
             </div>
             <div className="flex items-end justify-between">
                <div className="bg-[#8A1654] w-10 h-10 rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-[#6e1143] transition">
                    <span className="text-xl leading-none">↗</span>
                </div>
                <h2 className="text-4xl font-bold text-gray-800">{firstBatch?.students_count || 0}</h2>
             </div>
          </div>
        </div>
      </div>

      {/* 5. Table */}
      <h3 className="text-lg font-bold text-gray-700 mt-4 mb-2">معلومات الدورة ({pagination.total || 0})</h3>
      <BatchesTable
        batches={batches}
        pagination={pagination}
        page={page}
        onPageChange={setPage}
        isLoading={isLoading}
        selectedIds={selectedIds}
        onSelectChange={setSelectedIds}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <AddBatchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        batch={selectedBatch}
      />

      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        loading={isDeleting}
        title="حذف شعبة"
        description={`هل أنت متأكد من حذف الدورة/الشعبة ${batchToDelete?.name}؟`}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
