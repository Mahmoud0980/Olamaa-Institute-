// src/app/batches/page.jsx
"use client";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchBatches,
  addBatch,
  updateBatch,
  deleteBatch,
  selectAllBatches,
} from "@/redux/Slices/batchesSlice";
import { fetchBranches } from "@/redux/Slices/instituteBranchesSlice";
import { fetchAcademicBranches } from "@/redux/Slices/academicBranchesSlice";

const toKey = (v) => (v == null ? "" : String(v));

export default function BatchesPage() {
  const dispatch = useDispatch();
  const batches = useSelector(selectAllBatches);
  const { status, error } = useSelector((s) => s.batches);

  const { list: branches = [] } = useSelector((s) => s.branches ?? {});
  const { list: academicBranches = [] } = useSelector(
    (s) => s.academicBranches ?? {}
  );

  const [form, setForm] = useState({
    id: null,
    name: "",
    institute_branch_id: "",
    academic_branch_id: "",
    start_date: "",
    end_date: "",
    is_archived: false,
    is_hidden: false,
    is_completed: false,
  });

  useEffect(() => {
    dispatch(fetchBatches());
    dispatch(fetchBranches());
    dispatch(fetchAcademicBranches());
  }, [dispatch]);

  const branchMap = useMemo(
    () => new Map(branches.map((b) => [toKey(b.id), b.name])),
    [branches]
  );
  const academicBranchMap = useMemo(
    () => new Map(academicBranches.map((b) => [toKey(b.id), b.name])),
    [academicBranches]
  );

  const resetForm = () =>
    setForm({
      name: "",
      institute_branch_id: "",
      academic_branch_id: "",
      start_date: "",
      end_date: "",
      is_archived: false,
      is_hidden: false,
      is_completed: false,
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return alert("ادخل اسم الشعبة");
    if (!form.institute_branch_id) return alert("اختر الفرع");
    if (!form.academic_branch_id) return alert("اختر الفرع الأكاديمي");
    if (form.start_date && form.end_date && form.start_date > form.end_date)
      return alert("تاريخ النهاية يجب أن يكون بعد البداية");

    const payload = {
      name: form.name.trim(),
      institute_branch_id: Number(form.institute_branch_id),
      academic_branch_id: Number(form.academic_branch_id),
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      is_archived: !!form.is_archived,
      is_hidden: !!form.is_hidden,
      is_completed: !!form.is_completed,
    };

    try {
      if (form.id) {
        await dispatch(updateBatch({ id: form.id, data: payload })).unwrap();
      } else {
        await dispatch(addBatch(payload)).unwrap();
      }
      resetForm();
    } catch (e) {
      alert(typeof e === "string" ? e : e?.message || "فشل التنفيذ");
      // إن أردت تفاصيل 422 لكل حقل: console.log(e?.errors)
    }
  };

  const handleEdit = (b) =>
    setForm({
      id: b.id,
      name: b.name ?? "",
      institute_branch_id: toKey(b.institute_branch_id),
      academic_branch_id: toKey(b.academic_branch_id),
      start_date: b.start_date ?? "",
      end_date: b.end_date ?? "",
      is_archived: !!b.is_archived,
      is_hidden: !!b.is_hidden,
      is_completed: !!b.is_completed,
    });

  const handleDelete = async (id) => {
    if (!confirm("حذف الشعبة؟")) return;
    try {
      await dispatch(deleteBatch(id)).unwrap();
      if (form.id === id) resetForm();
    } catch (e) {
      alert(e?.message || "فشل الحذف");
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6" dir="rtl">
      <h1 className="text-2xl font-bold">الشعب / الدورات</h1>

      {/* رسائل خطأ عامة */}
      {status === "failed" && (
        <div className="rounded border border-red-300 bg-red-50 p-2 text-red-700 text-sm">
          {typeof error === "string" ? error : error?.message || "خطأ"}
        </div>
      )}

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-3 border rounded p-4"
      >
        <div>
          <label className="block mb-1">اسم الشعبة</label>
          <input
            className="border rounded p-2 w-full"
            value={form.name}
            onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
            placeholder="مثال: شعبة الصيف 2025"
          />
        </div>

        <div>
          <label className="block mb-1">الفرع</label>
          <select
            className="border rounded p-2 w-full"
            value={form.institute_branch_id}
            onChange={(e) =>
              setForm((s) => ({ ...s, institute_branch_id: e.target.value }))
            }
          >
            <option value="">اختر الفرع</option>
            {branches.map((b) => (
              <option key={b.id} value={toKey(b.id)}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1">الفرع الأكاديمي</label>
          <select
            className="border rounded p-2 w-full"
            value={form.academic_branch_id}
            onChange={(e) =>
              setForm((s) => ({ ...s, academic_branch_id: e.target.value }))
            }
          >
            <option value="">اختر الفرع الأكاديمي</option>
            {academicBranches.map((ab) => (
              <option key={ab.id} value={toKey(ab.id)}>
                {ab.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1">تاريخ البداية</label>
          <input
            type="date"
            className="border rounded p-2 w-full"
            value={form.start_date}
            onChange={(e) =>
              setForm((s) => ({ ...s, start_date: e.target.value }))
            }
          />
        </div>

        <div>
          <label className="block mb-1">تاريخ النهاية</label>
          <input
            type="date"
            className="border rounded p-2 w-full"
            value={form.end_date}
            onChange={(e) =>
              setForm((s) => ({ ...s, end_date: e.target.value }))
            }
          />
        </div>

        <div className="flex items-center gap-4 col-span-full">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.is_archived}
              onChange={(e) =>
                setForm((s) => ({ ...s, is_archived: e.target.checked }))
              }
            />
            مؤرشفة
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.is_hidden}
              onChange={(e) =>
                setForm((s) => ({ ...s, is_hidden: e.target.checked }))
              }
            />
            مخفية
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.is_completed}
              onChange={(e) =>
                setForm((s) => ({ ...s, is_completed: e.target.checked }))
              }
            />
            مكتملة
          </label>
        </div>

        <div className="flex gap-2 col-span-full">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
            disabled={status === "loading"}
          >
            {form.id ? "تحديث" : "إضافة"}
          </button>
          {form.id && (
            <button
              type="button"
              onClick={resetForm}
              className="border px-4 py-2 rounded"
            >
              إلغاء التعديل
            </button>
          )}
        </div>
      </form>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border rounded">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="p-2 text-right">الاسم</th>
              <th className="p-2 text-right">الفرع</th>
              <th className="p-2 text-right">الفرع الأكاديمي</th>
              <th className="p-2 text-right">البداية</th>
              <th className="p-2 text-right">النهاية</th>
              <th className="p-2 text-right">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {batches.map((b) => (
              <tr key={b.id} className="border-b">
                <td className="p-2">{b?.name ?? "—"}</td>
                <td className="p-2">
                  {branchMap.get(toKey(b?.institute_branch_id)) || "—"}
                </td>
                <td className="p-2">
                  {academicBranchMap.get(toKey(b?.academic_branch_id)) || "—"}
                </td>
                <td className="p-2">{b?.start_date ?? "—"}</td>
                <td className="p-2">{b?.end_date ?? "—"}</td>
                <td className="p-2 flex gap-2">
                  <button
                    className="bg-yellow-400 px-3 py-1 rounded"
                    onClick={() => handleEdit(b)}
                  >
                    تعديل
                  </button>
                  <button
                    className="bg-red-600 text-white px-3 py-1 rounded"
                    onClick={() => handleDelete(b.id)}
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))}
            {batches.length === 0 && (
              <tr>
                <td className="p-4 text-center text-gray-500" colSpan={6}>
                  لا توجد بيانات
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
