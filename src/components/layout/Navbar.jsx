"use client";

import { useDispatch, useSelector } from "react-redux";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

import QRModal from "../common/QRModal";
import { setSearchValue } from "@/store/slices/searchSlice";
import { useGetInstituteBranchesQuery } from "@/store/services/instituteBranchesApi";

import { useGetPaymentEditRequestsQuery } from "@/store/services/paymentEditRequestsApi";
import { useGetExamResultEditRequestsQuery } from "@/store/services/examResultEditRequestsApi";

/* ===============================
   helpers
   =============================== */
function safeJsonParse(v) {
  try {
    return JSON.parse(v);
  } catch {
    return null;
  }
}

function readAuthFromLocalStorage() {
  if (typeof window === "undefined") return { user: null };

  const candidates = ["token", "auth", "authData", "user", "me"];
  for (const k of candidates) {
    const raw = localStorage.getItem(k);
    if (!raw) continue;

    const parsed = safeJsonParse(raw);
    if (!parsed) continue;

    if (parsed?.user) return parsed;
    if (parsed?.full_name || parsed?.first_name || parsed?.photo_url) {
      return { user: parsed };
    }
  }

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const raw = localStorage.getItem(key);
    if (!raw) continue;

    const parsed = safeJsonParse(raw);
    if (!parsed) continue;

    if (parsed?.user) return parsed;
    if (parsed?.full_name || parsed?.first_name || parsed?.photo_url) {
      return { user: parsed };
    }
  }

  return { user: null };
}

function formatDateTime(v) {
  if (!v) return "—";
  const s = String(v);
  if (s.includes("T")) return s.replace("T", " ").slice(0, 16);
  return s;
}

// يدعم: data[], data.items[], items[], أو array مباشر
function toArray(res) {
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.data?.items)) return res.data.items;
  if (Array.isArray(res?.items)) return res.items;
  if (Array.isArray(res)) return res;
  return [];
}

/* ====== Notifications labels (Payments + Grades) ====== */
function statusLabelFromRaw(r) {
  const s = String(r?.status || "").toLowerCase();
  if (s === "pending") return "قيد الانتظار";
  if (s === "approved") return "مقبول";
  if (s === "rejected") return "مرفوض";
  return r?.status ?? "—";
}

function actionLabel(item) {
  const r = item?.raw;

  if (item?.kind === "payment") {
    const act = String(r?.action || "").toLowerCase();
    if (act === "delete") return "طلب حذف دفعة";
    if (act === "edit" || act === "update") return "طلب تعديل دفعة";
    return "طلب دفعة";
  }

  // grade
  const t = String(r?.type || r?.action || "").toLowerCase(); // update | delete
  if (t === "delete") return "طلب حذف علامة";
  if (t === "update" || t === "edit") return "طلب تعديل علامة";
  return "طلب علامة";
}

function requesterNameFromRaw(r) {
  const u =
    r?.requester || r?.requester_user || r?.user || r?.requested_by || null;
  if (!u) return r?.requester_name || r?.requester_full_name || "—";
  return (
    u?.full_name ||
    [u?.first_name, u?.last_name].filter(Boolean).join(" ") ||
    u?.name ||
    u?.email ||
    "—"
  );
}

function requesterAvatarFromRaw(r) {
  const u =
    r?.requester || r?.requester_user || r?.user || r?.requested_by || null;
  return u?.photo_url || u?.avatar || "/avatar.svg";
}

function secondaryLine(item) {
  const r = item?.raw;

  if (item?.kind === "payment") {
    const paymentId =
      r?.payment_id ?? r?.payment?.id ?? r?.original_data?.id ?? "—";
    return `المستخدم: ${requesterNameFromRaw(r)} — الدفعة #${paymentId}`;
  }

  // grade
  const rid =
    r?.exam_result_id ?? r?.exam_result?.id ?? r?.original_data?.id ?? "—";
  const st = r?.exam_result?.student;
  const studentName =
    `${st?.first_name ?? ""} ${st?.last_name ?? ""}`.trim() ||
    `طالب #${r?.exam_result?.student_id ?? "—"}`;
  const examName =
    r?.exam_result?.exam?.name ?? `امتحان #${r?.exam_result?.exam_id ?? "—"}`;
  return `المستخدم: ${requesterNameFromRaw(r)} — نتيجة #${rid} — ${studentName} (${examName})`;
}

/* ===============================
   Smart Auto Flip positioning
   =============================== */
function computeDropdownPos(anchorRect, panelRect, gap = 10, margin = 10) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // الافتراضي: تحت الزر (bottom-end في RTL غالباً)
  let top = anchorRect.bottom + gap;
  let left = anchorRect.right - panelRect.width; // يمين

  // لو خرج يمين/يسار
  if (left < margin) left = margin;
  if (left + panelRect.width > vw - margin)
    left = Math.max(margin, vw - margin - panelRect.width);

  // Flip لو ما في مساحة تحت
  const spaceBelow = vh - anchorRect.bottom;
  const spaceAbove = anchorRect.top;

  const needHeight = panelRect.height + gap;
  const canPlaceBelow = spaceBelow >= needHeight;
  const canPlaceAbove = spaceAbove >= needHeight;

  if (!canPlaceBelow && canPlaceAbove) {
    top = anchorRect.top - gap - panelRect.height; // فوق
  } else {
    // إذا neither كافي، خليها بالأفضل (أكبر مساحة) وتقص بالـ maxHeight من CSS
    if (!canPlaceBelow && !canPlaceAbove) {
      top =
        spaceBelow >= spaceAbove
          ? anchorRect.bottom + gap
          : Math.max(margin, anchorRect.top - gap - panelRect.height);
    }
  }

  // لو خرج فوق/تحت
  if (top < margin) top = margin;
  if (top + panelRect.height > vh - margin)
    top = Math.max(margin, vh - margin - panelRect.height);

  return { top, left };
}

/* ===============================
   Notifications Dropdown (smart flip)
   =============================== */
function NotificationsDropdown({
  anchorRef,
  loading,
  count,
  items,
  onClose,
  onMore,
}) {
  const panelRef = useRef(null);
  const [pos, setPos] = useState({ top: 0, left: 0, ready: false });

  const updatePos = () => {
    const anchorEl = anchorRef?.current;
    const panelEl = panelRef.current;
    if (!anchorEl || !panelEl) return;

    const a = anchorEl.getBoundingClientRect();

    // قياس فعلي للوحة
    const p = panelEl.getBoundingClientRect();

    const next = computeDropdownPos(a, p, 10, 10);
    setPos({ ...next, ready: true });
  };

  useEffect(() => {
    // أول تموضع
    const t = setTimeout(updatePos, 0);

    // تحديث عند resize/scroll
    const onResize = () => updatePos();
    const onScroll = () => updatePos();

    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, true); // مهم لو في containers scroll

    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {/* overlay لإغلاق عند الضغط خارج */}
      <div className="fixed inset-0 z-[60]" onClick={onClose} />

      {/* dropdown floating */}
      <div
        dir="rtl"
        ref={panelRef}
        style={{
          position: "fixed",
          top: pos.top,
          left: pos.left,
          opacity: pos.ready ? 1 : 0,
          transform: pos.ready ? "translateY(0)" : "translateY(-4px)",
          transition: "opacity 120ms ease, transform 120ms ease",
        }}
        className="
          z-[70]
          w-[380px] max-w-[92vw]
          bg-white rounded-xl shadow-xl
          border border-gray-200
          overflow-hidden
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-800">الإشعارات</h3>
            {count > 0 && (
              <span className="text-[12px] text-gray-500">({count})</span>
            )}
          </div>

          <button
            type="button"
            onClick={onMore}
            className="text-xs text-[#7B0046] hover:underline"
          >
            عرض المزيد
          </button>
        </div>

        {/* body */}
        <div className="max-h-[420px] overflow-y-auto p-3 space-y-3">
          {loading ? (
            <div className="py-10 text-center text-sm text-gray-500">
              جارٍ التحميل...
            </div>
          ) : !items?.length ? (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-gray-500">
              لا توجد إشعارات حالياً
            </div>
          ) : (
            items.map((it) => {
              const r = it.raw;
              const key = `${it.kind}-${String(it.id ?? it.created_at ?? "")}`;

              return (
                <div
                  key={key}
                  className="rounded-xl border border-gray-200 p-3 shadow-sm bg-white"
                >
                  <div className="flex gap-3">
                    <img
                      src={requesterAvatarFromRaw(r)}
                      alt=""
                      className="h-9 w-9 rounded-full ring-2 ring-white object-cover"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[13px] font-semibold text-gray-800 line-clamp-1">
                          {actionLabel(it)}
                        </p>

                        <span className="text-[11px] text-gray-400">
                          {formatDateTime(r?.created_at || r?.updated_at)}
                        </span>
                      </div>

                      <p className="mt-1 text-[12px] leading-5 text-gray-600 line-clamp-2">
                        {secondaryLine(it)}
                      </p>

                      <div className="mt-2 flex items-center gap-2 text-[12px]">
                        <span className="text-gray-500">الحالة:</span>
                        <span className="font-medium text-[#6D003E]">
                          {statusLabelFromRaw(r)}
                        </span>
                      </div>

                      {r?.reason && (
                        <div className="mt-2 text-[12px] text-gray-500 line-clamp-1">
                          السبب: {String(r.reason)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* footer */}
        <div className="p-3 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="border border-gray-300 px-4 py-1 rounded-md text-sm hover:bg-gray-50"
          >
            إغلاق
          </button>
        </div>
      </div>
    </>
  );
}

function IconBox({ icon, onClick, badgeCount = 0, buttonRef }) {
  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={onClick}
      className="relative w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 cursor-pointer hover:bg-gray-200"
    >
      <Image src={icon} width={40} height={40} alt="icon" />

      {Number(badgeCount) > 0 && (
        <span
          className="
            absolute -top-1 -right-1
            min-w-[18px] h-[18px]
            px-1
            rounded-full
            bg-[#D40078]
            text-white text-[11px]
            flex items-center justify-center
            border-2 border-white
          "
        >
          {badgeCount > 99 ? "99+" : badgeCount}
        </span>
      )}
    </button>
  );
}

/* ===============================
   Navbar
   =============================== */
export default function Navbar() {
  const dispatch = useDispatch();
  const pathname = usePathname();
  const router = useRouter();

  const [openQR, setOpenQR] = useState(false);
  const [canUseQR, setCanUseQR] = useState(false);
  const [qrHint, setQrHint] = useState("مسح QR");
  const [branchInitialized, setBranchInitialized] = useState(false);

  /* ===============================
     👤 user
     =============================== */
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const parsed = readAuthFromLocalStorage();
    const u = parsed?.user || null;

    setUser(u);

    const roles = Array.isArray(u?.roles) ? u.roles : [];
    const admin =
      roles.includes("admin") ||
      roles.some((r) => r?.name === "admin" || r?.key === "admin");

    setIsAdmin(Boolean(admin));
  }, []);

  const userName = useMemo(() => {
    if (!user) return "—";
    return (
      user?.full_name ||
      [user?.first_name, user?.last_name].filter(Boolean).join(" ") ||
      user?.name ||
      "—"
    );
  }, [user]);

  const userPhoto = user?.photo_url || "/avatar.svg";
  const userBranchId = user?.instituteBranch?.id ?? null;
  const userBranchName = user?.instituteBranch?.name || "—";

  /* ===============================
     🔑 searchKey by route
     =============================== */
  const searchKey = pathname.startsWith("/employees")
    ? "employees"
    : pathname.startsWith("/batches")
      ? "batches"
      : pathname.startsWith("/students")
        ? "students"
        : pathname.startsWith("/knowWays")
          ? "knowWays"
          : pathname.startsWith("/classRooms")
            ? "classRooms"
            : pathname.startsWith("/academic-branches") ||
                pathname.startsWith("/academicBranches")
              ? "academicBranches"
              : pathname.startsWith("/instituteBranches")
                ? "instituteBranches"
                : pathname.startsWith("/cities")
                  ? "cities"
                  : pathname.startsWith("/buses")
                    ? "buses"
                    : pathname.startsWith("/teachers")
                      ? "teachers"
                      : pathname.startsWith("/subjects")
                        ? "subjects"
                        : pathname.startsWith("/attendance")
                          ? "attendance"
                          : pathname.startsWith("/payments")
                            ? "payments"
                            : pathname.startsWith("/exams")
                              ? "exams"
                              : "employees";

  const search = useSelector((state) => state.search.values[searchKey]);

  /* ===============================
     🏢 branches list + selected branch
     =============================== */
  const branchId = useSelector((state) => state.search.values.branch);
  const { data } = useGetInstituteBranchesQuery();
  const branches = data?.data || [];

  useEffect(() => {
    if (!user) return;

    const current = branchId;
    const uBranchId = user?.instituteBranch?.id;

    if (!isAdmin) {
      if (uBranchId != null) {
        const mustBe = String(uBranchId);
        if (String(current ?? "") !== mustBe) {
          dispatch(setSearchValue({ key: "branch", value: mustBe }));
        }
      } else {
        if ((current ?? "") !== "") {
          dispatch(setSearchValue({ key: "branch", value: "" }));
        }
      }
      return;
    }

    if (!branchInitialized) {
      if (uBranchId != null) {
        dispatch(setSearchValue({ key: "branch", value: String(uBranchId) }));
      } else {
        dispatch(setSearchValue({ key: "branch", value: "" }));
      }
      setBranchInitialized(true);
    }
  }, [user, isAdmin, branchId, dispatch, branchInitialized]);

  /* ===============================
     📷 camera check for QR
     =============================== */
  useEffect(() => {
    const checkCamera = async () => {
      try {
        if (typeof window !== "undefined" && !window.isSecureContext) {
          setCanUseQR(false);
          setQrHint("الكاميرا تحتاج HTTPS أو localhost");
          return;
        }

        if (
          typeof navigator === "undefined" ||
          !navigator.mediaDevices ||
          typeof navigator.mediaDevices.enumerateDevices !== "function" ||
          typeof navigator.mediaDevices.getUserMedia !== "function"
        ) {
          setCanUseQR(false);
          setQrHint("الجهاز لا يدعم الكاميرا");
          return;
        }

        const devices = await navigator.mediaDevices.enumerateDevices();
        const hasCamera = devices.some((d) => d.kind === "videoinput");

        setCanUseQR(hasCamera);
        setQrHint(hasCamera ? "مسح QR" : "لا يوجد كاميرا على هذا الجهاز");
      } catch {
        setCanUseQR(true);
        setQrHint("مسح QR");
      }
    };

    checkCamera();
  }, []);

  /* ===============================
     🔔 Notifications (payments + grades) + smart flip dropdown
     =============================== */
  const [openNotifications, setOpenNotifications] = useState(false);
  const notifBtnRef = useRef(null);

  const payQ = useGetPaymentEditRequestsQuery(
    { status: "pending" },
    { pollingInterval: 10000, refetchOnFocus: true },
  );

  const gradeQ = useGetExamResultEditRequestsQuery(
    { status: "pending" },
    { pollingInterval: 10000, refetchOnFocus: true },
  );

  const loadingNotifs =
    payQ.isLoading || payQ.isFetching || gradeQ.isLoading || gradeQ.isFetching;

  const mergedLatest5 = useMemo(() => {
    const payments = toArray(payQ.data).map((x) => ({
      kind: "payment",
      id: x.id,
      created_at: x.created_at,
      raw: x,
    }));

    const grades = toArray(gradeQ.data).map((x) => ({
      kind: "grade",
      id: x.id,
      created_at: x.created_at,
      raw: x,
    }));

    const merged = [...payments, ...grades].sort((a, b) =>
      String(b.created_at || "").localeCompare(String(a.created_at || "")),
    );

    return merged.slice(0, 5);
  }, [payQ.data, gradeQ.data]);

  const unreadCount = useMemo(() => mergedLatest5.length, [mergedLatest5]);

  // ESC close
  useEffect(() => {
    if (!openNotifications) return;
    const onKey = (e) => {
      if (e.key === "Escape") setOpenNotifications(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openNotifications]);

  // close on route change
  useEffect(() => {
    setOpenNotifications(false);
  }, [pathname]);

  return (
    <>
      <div className="flex items-center justify-end lg:justify-between px-6 py-4 bg-white">
        {/* ================= SEARCH ================= */}
        <div className="hidden lg:flex items-center gap-3 rounded-lg bg-[#F3F3F3] px-3 w-[231px] xl:w-[446px] h-[50px]">
          <Image
            src="/search.svg"
            width={20}
            height={20}
            alt="search"
            className="opacity-60"
          />
          <input
            type="text"
            placeholder="البحث عن ..."
            value={search ?? ""}
            onChange={(e) =>
              dispatch(
                setSearchValue({
                  key: searchKey,
                  value: e.target.value,
                }),
              )
            }
            className="w-full h-full bg-transparent outline-none text-[16px] text-gray-700"
          />
        </div>

        {/* ================= RIGHT SIDE ================= */}
        <div className="flex items-center gap-5">
          {/* 🔔 Notifications (smart flip) */}
          <div className="relative">
            {isAdmin && (
              <IconBox
                buttonRef={notifBtnRef}
                icon="/icons/notification.png"
                badgeCount={unreadCount}
                onClick={() => setOpenNotifications((v) => !v)}
              />
            )}

            {isAdmin && openNotifications && (
              <NotificationsDropdown
                anchorRef={notifBtnRef}
                loading={loadingNotifs}
                count={unreadCount}
                items={mergedLatest5}
                onClose={() => setOpenNotifications(false)}
                onMore={() => {
                  setOpenNotifications(false);
                  router.push("/requests");
                }}
              />
            )}
          </div>

          {/* messages (كما هو) */}
          <IconBox icon="/icons/message.png" onClick={() => {}} />

          {/* QR */}
          <div
            className={`w-10 h-10 flex items-center justify-center rounded-full
              ${
                canUseQR
                  ? "bg-gray-100 cursor-pointer hover:bg-gray-200"
                  : "bg-gray-200 cursor-not-allowed opacity-50"
              }`}
            onClick={() => {
              if (canUseQR) setOpenQR(true);
            }}
            title={qrHint}
          >
            <Image src="/icons/QrBtn.png" width={40} height={40} alt="qr" />
          </div>

          {/* Avatar */}
          <Image
            src={userPhoto}
            width={44}
            height={44}
            className="rounded-full object-cover"
            alt="avatar"
          />

          {/* Name + Branch */}
          <div className="flex flex-col items-center leading-tight">
            <span className="text-[14px] md:text-[16px] font-semibold text-gray-800">
              {userName}
            </span>

            <div className="relative">
              <select
                value={branchId ?? ""}
                onChange={(e) =>
                  dispatch(
                    setSearchValue({
                      key: "branch",
                      value: e.target.value,
                    }),
                  )
                }
                disabled={!isAdmin}
                className={`appearance-none bg-transparent pr-5 text-[12px] outline-none
                  ${
                    isAdmin
                      ? "text-gray-400 cursor-pointer"
                      : "text-gray-400 cursor-not-allowed opacity-70"
                  }`}
                title={!isAdmin ? `فرعك: ${userBranchName}` : "اختيار الفرع"}
              >
                {isAdmin && <option value="">كل الفروع</option>}

                {!isAdmin && userBranchId == null && (
                  <option value="">—</option>
                )}

                {branches.map((b) => (
                  <option key={b.id} value={String(b.id)}>
                    {b.name}
                  </option>
                ))}
              </select>

              <ChevronDown
                className={`absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none
                  ${isAdmin ? "text-gray-400" : "text-gray-300"}`}
              />
            </div>
          </div>
        </div>
      </div>

      {openQR && <QRModal onClose={() => setOpenQR(false)} />}
    </>
  );
}
