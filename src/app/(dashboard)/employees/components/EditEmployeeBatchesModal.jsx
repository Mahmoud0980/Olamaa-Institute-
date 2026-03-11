// "use client";

// import { X } from "lucide-react";
// import { useEffect, useState } from "react";
// import toast from "react-hot-toast";

// import { useGetBatchesQuery } from "@/store/services/batchesApi";
// import { useAssignOrUpdateEmployeeMutation } from "@/store/services/employeesApi";

// export default function EditEmployeeBatchesModal({
//   isOpen,
//   onClose,
//   employee,
// }) {
//   const { data: batchesData } = useGetBatchesQuery();
//   const batches = batchesData?.data || [];

//   const [assignBatches] = useAssignOrUpdateEmployeeMutation();
//   const [selected, setSelected] = useState([]);

//   useEffect(() => {
//     if (employee) setSelected(employee.batches?.map((b) => b.id) || []);
//   }, [employee]);

//   const saveBatches = async () => {
//     try {
//       await assignBatches({
//         id: employee.id,
//         batch_ids: selected,
//       }).unwrap();

//       toast.success("تم تحديث الدورات");
//       onClose();
//     } catch {
//       toast.error("حدث خطأ أثناء الحفظ");
//     }
//   };

//   if (!isOpen || !employee) return null;

//   return (
//     <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
//       <div className="bg-white p-6 w-full max-w-xl rounded-lg shadow-lg">
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-lg font-bold text-[#6F013F]">تعديل الدورات</h2>
//           <button onClick={onClose}>
//             <X />
//           </button>
//         </div>

//         <div className="space-y-3 max-h-72 overflow-y-auto">
//           {batches.map((b) => (
//             <label key={b.id} className="flex items-center gap-2">
//               <input
//                 type="checkbox"
//                 checked={selected.includes(b.id)}
//                 onChange={() => {
//                   setSelected((old) =>
//                     old.includes(b.id)
//                       ? old.filter((x) => x !== b.id)
//                       : [...old, b.id]
//                   );
//                 }}
//               />
//               {b.name}
//             </label>
//           ))}
//         </div>

//         <button
//           onClick={saveBatches}
//           className="mt-4 w-full py-2 bg-[#6F013F] text-white rounded-lg"
//         >
//           حفظ الدورات
//         </button>
//       </div>
//     </div>
//   );
// }
