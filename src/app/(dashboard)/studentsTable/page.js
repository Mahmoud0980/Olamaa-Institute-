"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation"; // إن لم تكن على Next.js استبدلها بـ react-router-dom
import {
  fetchStudents,
  deleteStudent,
  updateStudent,
} from "@/redux/Slices/studentsSlice";
import { addUser } from "@/redux/Slices/usersSlice";

const fmt = (d) => (d ? String(d).slice(0, 10) : "—");

export default function StudentsTable() {
  const dispatch = useDispatch();
  const router = useRouter();

  // حالة الطلاب
  const { list, status, error } = useSelector((s) => s.students);

  // حنخليها Array دايماً حتى لو رجع الـ API كائن مغلّف
  const students = Array.isArray(list)
    ? list
    : Array.isArray(list?.data)
    ? list.data
    : [];

  // بحث + تأكيد حذف
  const [query, setQuery] = useState("");
  const [confirmId, setConfirmId] = useState(null);

  // مودال إنشاء مستخدم
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [serverErrors, setServerErrors] = useState({});
  const [userForm, setUserForm] = useState({
    unique_id: "",
    name: "",
    password: "",
    is_approved: true,
    force_password_change: false,
  });

  useEffect(() => {
    if (status === "idle") dispatch(fetchStudents());
  }, [dispatch, status]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return students;
    return students.filter((s) => {
      const hay = [
        s.full_name,
        s.first_name,
        s.last_name,
        s.birth_place,
        s.gender,
        s?.guardians?.map((g) => `${g.first_name} ${g.last_name}`).join(" "),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [students, query]);

  const onDelete = async (id) => {
    try {
      await dispatch(deleteStudent(id)).unwrap();
    } catch {
      alert("فشل حذف الطالب");
    } finally {
      setConfirmId(null);
    }
  };

  const goEdit = (id) => {
    // Next.js App Router
    router.push(`/students/${id}/edit`);
    // أو React Router: navigate(`/students/${id}/edit`);
  };

  // فتح مودال إنشاء المستخدم و تعبئة الاسم من الطالب
  const openCreateUser = (student) => {
    setSelectedStudent(student);
    setServerErrors({});
    setUserForm({
      unique_id: "",
      name:
        student.full_name ??
        `${student.first_name ?? ""} ${student.last_name ?? ""}`.trim(),
      password: "",
      is_approved: true,
      force_password_change: false,
    });
    setUserModalOpen(true);
  };

  const submitCreateUser = async (e) => {
    e.preventDefault();
    if (!selectedStudent) return;

    // تحقق بسيط لاسم المستخدم
    const uid = userForm.unique_id.trim();
    if (!/^[A-Za-z0-9._-]{3,32}$/.test(uid)) {
      alert(
        "اسم المستخدم يجب أن يكون بدون فراغات، 3-32 حرف/رقم، ويسمح بـ . _ -"
      );
      return;
    }

    try {
      setCreatingUser(true);
      setServerErrors({});

      // 1) إنشاء المستخدم وفق السكيما المعطاة
      const userPayload = {
        unique_id: uid,
        name: userForm.name.trim(),
        password: userForm.password,
        role: "student",
        is_approved: !!userForm.is_approved,
        force_password_change: !!userForm.force_password_change,
      };

      const createdUserResp = await dispatch(addUser(userPayload)).unwrap();
      const createdUser = createdUserResp?.data ?? createdUserResp;
      const newUserId = createdUser?.id;
      if (!newUserId) {
        throw new Error("لم يتم إرجاع رقم المستخدم من الخادم");
      }

      // 2) تحديث الطالب بـ user_id
      await dispatch(
        updateStudent({
          id: selectedStudent.id,
          updatedData: { user_id: newUserId },
        })
      ).unwrap();

      setUserModalOpen(false);
      setSelectedStudent(null);
      alert("✅ تم إنشاء المستخدم وربط الطالب به");
    } catch (err) {
      // عرض أخطاء Laravel إن وجدت
      const apiErr = err?.response?.data || err;
      const errs = apiErr?.errors || {};
      setServerErrors(errs);
      const msg =
        apiErr?.message ||
        (errs && Object.values(errs).flat().join("\n")) ||
        "فشل العملية";
      alert(msg);
    } finally {
      setCreatingUser(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto bg-white p-6 rounded-2xl shadow">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="text-lg font-semibold">قائمة الطلاب</h2>
        <input
          placeholder="ابحث بالاسم / المكان / الولي..."
          className="border rounded px-3 py-2 w-64"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* حالات التحميل والخطأ */}
      {status === "loading" && (
        <p className="text-sm text-gray-600">جاري تحميل الطلاب...</p>
      )}
      {status === "failed" && (
        <p className="text-sm text-red-600">
          حدث خطأ: {String(error || "غير معروف")}
        </p>
      )}

      {/* جدول */}
      {status === "succeeded" && (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-right p-2">#</th>
                <th className="text-right p-2">الاسم</th>
                <th className="text-right p-2">الجنس</th>
                <th className="text-right p-2">الميلاد</th>
                <th className="text-right p-2">التسجيل</th>
                <th className="text-right p-2">بدء الدوام</th>
                <th className="text-right p-2">user_id</th>
                <th className="text-right p-2">أولياء الأمور</th>
                <th className="text-right p-2">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, idx) => (
                <tr key={s.id} className="border-b">
                  <td className="p-2">{idx + 1}</td>
                  <td className="p-2">
                    <div className="font-medium">{s.full_name}</div>
                    <div className="text-gray-500">{s.birth_place || "—"}</div>
                  </td>
                  <td className="p-2">
                    {s.gender === "male"
                      ? "ذكر"
                      : s.gender === "female"
                      ? "أنثى"
                      : "—"}
                  </td>
                  <td className="p-2">{fmt(s.date_of_birth)}</td>
                  <td className="p-2">{fmt(s.enrollment_date)}</td>
                  <td className="p-2">{fmt(s.start_attendance_date)}</td>
                  <td className="p-2">{s.user_id ?? "—"}</td>
                  <td className="p-2">
                    {Array.isArray(s.guardians) && s.guardians.length ? (
                      <ul className="list-disc pr-4">
                        {s.guardians.map((g) => (
                          <li key={g.id}>
                            {g.first_name} {g.last_name}{" "}
                            <span className="text-gray-500">
                              ({g.relationship})
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="p-2">
                    <div className="flex gap-2 flex-wrap">
                      <button
                        className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                        onClick={() => goEdit(s.id)}
                      >
                        تعديل
                      </button>
                      <button
                        className="px-3 py-1 rounded bg-amber-600 text-white hover:bg-amber-700"
                        onClick={() => openCreateUser(s)}
                        disabled={!!s.user_id}
                        title={
                          s.user_id ? "هذا الطالب مرتبط بمستخدم بالفعل" : ""
                        }
                      >
                        إنشاء مستخدم
                      </button>
                      <button
                        className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                        onClick={() => setConfirmId(s.id)}
                      >
                        حذف
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-4 text-center text-gray-500">
                    لا توجد نتائج مطابقة.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* تأكيد الحذف */}
      {confirmId !== null && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-5 w-full max-w-md shadow-lg">
            <h3 className="text-lg font-semibold mb-3">تأكيد الحذف</h3>
            <p className="text-sm text-gray-700 mb-6">
              هل أنت متأكد من حذف هذا الطالب؟
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmId(null)}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
              >
                إلغاء
              </button>
              <button
                onClick={() => onDelete(confirmId)}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
              >
                حذف نهائي
              </button>
            </div>
          </div>
        </div>
      )}

      {/* مودال إنشاء مستخدم */}
      {userModalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-5 w-full max-w-md shadow-lg">
            <h3 className="text-lg font-semibold mb-3">إنشاء مستخدم للطالب</h3>
            <p className="text-sm text-gray-700 mb-4">
              الطالب:{" "}
              <span className="font-medium">{selectedStudent.full_name}</span>
            </p>

            <form onSubmit={submitCreateUser} className="space-y-3">
              <div>
                <label className="block text-sm mb-1">
                  اسم المستخدم (unique_id)
                </label>
                <input
                  type="text"
                  required
                  className="w-full border rounded px-3 py-2"
                  value={userForm.unique_id}
                  onChange={(e) =>
                    setUserForm((f) => ({ ...f, unique_id: e.target.value }))
                  }
                  placeholder="مثال: user123"
                />
                {serverErrors.unique_id && (
                  <p className="text-sm text-red-600 mt-1">
                    {serverErrors.unique_id[0]}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm mb-1">
                  الاسم الظاهر (name)
                </label>
                <input
                  type="text"
                  required
                  className="w-full border rounded px-3 py-2"
                  value={userForm.name}
                  onChange={(e) =>
                    setUserForm((f) => ({ ...f, name: e.target.value }))
                  }
                />
                {serverErrors.name && (
                  <p className="text-sm text-red-600 mt-1">
                    {serverErrors.name[0]}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm mb-1">كلمة المرور</label>
                <input
                  type="password"
                  required
                  className="w-full border rounded px-3 py-2"
                  value={userForm.password}
                  onChange={(e) =>
                    setUserForm((f) => ({ ...f, password: e.target.value }))
                  }
                />
                {serverErrors.password && (
                  <p className="text-sm text-red-600 mt-1">
                    {serverErrors.password[0]}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="inline-flex items-center gap-2 select-none">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={userForm.is_approved}
                    onChange={(e) =>
                      setUserForm((f) => ({
                        ...f,
                        is_approved: e.target.checked,
                      }))
                    }
                  />
                  <span>تفعيل الحساب (is_approved)</span>
                </label>

                <label className="inline-flex items-center gap-2 select-none">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={userForm.force_password_change}
                    onChange={(e) =>
                      setUserForm((f) => ({
                        ...f,
                        force_password_change: e.target.checked,
                      }))
                    }
                  />
                  <span>إجبار تغيير كلمة المرور عند أول دخول</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setUserModalOpen(false)}
                  className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={creatingUser}
                  className="px-4 py-2 rounded bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-60"
                >
                  {creatingUser ? "جارٍ الإنشاء..." : "إنشاء"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
