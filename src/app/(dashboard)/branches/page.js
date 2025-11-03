"use client";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchBranches,
  addBranch,
  updateBranch,
  deleteBranch,
  setSelectedBranchId,
} from "../../../redux/Slices/instituteBranchesSlice";
import BranchModal from "../../../components/common/BranchModal";

export default function BranchesPage() {
  const selectedBranchId = useSelector(
    (state) => state.branches.selectedBranchId
  );
  const dispatch = useDispatch();
  const { list } = useSelector((state) => state.branches);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [operation, setOperation] = useState("add"); // "add" | "edit" | "delete"

  const [branchNames, setBranchNames] = useState([]);

  useEffect(() => {
    setBranchNames(list.map((b) => b.name));
  }, [list]);

  const handleAdd = async (newBranch) => {
    await dispatch(addBranch(newBranch)); // أرسل للـ API و Redux
    dispatch(setSelectedBranchId("")); // إعادة تعيين الفلترة لعرض كل العناصر
    setModalOpen(false);
  };

  const handleUpdate = (data) => {
    dispatch(updateBranch({ id: selectedBranch.id, data }));
    setModalOpen(false);
    dispatch(setSelectedBranchId(""));
    setSelectedBranch(null);
  };

  const handleDeleteConfirm = () => {
    dispatch(deleteBranch(selectedBranch.id));
    setModalOpen(false);
    dispatch(setSelectedBranchId(""));
    setSelectedBranch(null);
  };

  // ===================== فلترة الجدول حسب الاسم =====================
  const filteredBranches = selectedBranchId
    ? list.filter(
        (branch) => branch.id.toString() === selectedBranchId.toString()
      )
    : list;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
        إدارة الفروع
      </h1>

      <div className="flex justify-end mb-4">
        <button
          onClick={() => {
            setOperation("add");
            setSelectedBranch(null);
            setModalOpen(true);
          }}
          className="px-6 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition duration-300"
        >
          إضافة فرع جديد
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300 shadow-md rounded-lg">
          <thead className="bg-gray-200">
            <tr>
              <th className="py-3 px-4 text-sm font-semibold text-gray-700 text-center border-b">
                اسم الفرع
              </th>
              <th className="py-3 px-4 text-sm font-semibold text-gray-700 text-center border-b">
                رقم الهاتف
              </th>
              <th className="py-3 px-4 text-sm font-semibold text-gray-700 text-center border-b">
                البريد الإلكتروني
              </th>
              <th className="py-3 px-4 text-sm font-semibold text-gray-700 text-center border-b">
                رمز المدينة
              </th>
              <th className="py-3 px-4 text-sm font-semibold text-gray-700 text-center border-b">
                العنوان
              </th>
              <th className="py-3 px-4 text-sm font-semibold text-gray-700 text-center border-b">
                المدير
              </th>
              <th className="py-3 px-4 text-sm font-semibold text-gray-700 text-center border-b">
                إجراءات
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredBranches.length > 0 ? (
              filteredBranches.map((branch) => (
                <tr key={branch.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-700 text-center border-b">
                    {branch.name}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700 text-center border-b">
                    {branch.phone}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700 text-center border-b">
                    {branch.email}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700 text-center border-b">
                    {branch.country_code}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700 text-center border-b">
                    {branch.address}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700 text-center border-b">
                    {branch.manager_name}
                  </td>
                  <td className="py-3 px-4 text-sm text-center border-b space-x-2">
                    <button
                      onClick={() => {
                        setSelectedBranch(branch);
                        setOperation("edit");
                        setModalOpen(true);
                      }}
                      className="px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition duration-300"
                    >
                      تعديل
                    </button>
                    <button
                      onClick={() => {
                        setSelectedBranch(branch);
                        setOperation("delete");
                        setModalOpen(true);
                      }}
                      className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-300"
                    >
                      حذف
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="py-4 text-center text-gray-500">
                  لا يوجد فروع مطابقة للاختيار
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal موحد */}
      <BranchModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedBranch(null);
        }}
        onSubmit={operation === "edit" ? handleUpdate : handleAdd}
        defaultValues={selectedBranch}
        operation={operation}
        onDeleteConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
