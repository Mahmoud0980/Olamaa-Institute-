"use client";

import { useDispatch, useSelector } from "react-redux";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

import QRModal from "../common/QRModal";
import { setSearchValue } from "@/store/slices/searchSlice";
import { useGetInstituteBranchesQuery } from "@/store/services/instituteBranchesApi";

/* ===============================
   Helpers
   =============================== */
const isDesktopDevice = () => {
  if (typeof navigator === "undefined") return false;
  return !/Mobi|Android|iPhone|iPad|Tablet/i.test(navigator.userAgent);
};

export default function Navbar() {
  const dispatch = useDispatch();
  const pathname = usePathname();

  const [openQR, setOpenQR] = useState(false);
  const [canUseQR, setCanUseQR] = useState(false);

  /* ===============================
     🔑 تحديد مفتاح البحث حسب الصفحة
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
    : "employees";

  /* ===============================
     🔎 البحث
     =============================== */
  const search = useSelector((state) => state.search.values[searchKey]);

  /* ===============================
     🏢 الفروع
     =============================== */
  const branchId = useSelector((state) => state.search.values.branch);
  const { data } = useGetInstituteBranchesQuery();
  const branches = data?.data || [];

  /* ===============================
     ⭐ قيمة افتراضية للفرع
     =============================== */
  useEffect(() => {
    if (branchId === undefined) {
      dispatch(
        setSearchValue({
          key: "branch",
          value: "",
        })
      );
    }
  }, [branchId, dispatch]);

  /* ===============================
     📷 فحص الكاميرا + الجهاز
     =============================== */
  useEffect(() => {
    const checkCamera = async () => {
      if (!isDesktopDevice()) {
        setCanUseQR(false);
        return;
      }

      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const hasCamera = devices.some((d) => d.kind === "videoinput");
        setCanUseQR(hasCamera);
      } catch {
        setCanUseQR(false);
      }
    };

    checkCamera();
  }, []);

  return (
    <>
      <div className="flex items-center justify-between px-6 py-4 bg-white">
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
                })
              )
            }
            className="w-full h-full bg-transparent outline-none text-[16px] text-gray-700"
          />
        </div>

        {/* ================= RIGHT SIDE ================= */}
        <div className="flex items-center gap-5">
          {/* 🔔 Notifications */}
          <IconBox icon="/icons/notification.png" />

          {/* 💬 Messages */}
          <IconBox icon="/icons/message.png" />

          {/* 📱 QR */}
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
            title={canUseQR ? "مسح QR" : "QR يعمل فقط على الكمبيوتر مع كاميرا"}
          >
            <Image src="/icons/QR.png" width={22} height={22} alt="qr" />
          </div>

          {/* 👤 Avatar */}
          <Image
            src="/avatar.svg"
            width={44}
            height={44}
            className="rounded-full"
            alt="avatar"
          />

          {/* 👩‍💼 Name + Branch */}
          <div className="flex flex-col items-end leading-tight">
            <span className="text-[14px] md:text-[16px] font-semibold text-gray-800">
              المشرفة راما الأحمد
            </span>

            <div className="relative">
              <select
                value={branchId ?? ""}
                onChange={(e) =>
                  dispatch(
                    setSearchValue({
                      key: "branch",
                      value: e.target.value,
                    })
                  )
                }
                className="appearance-none bg-transparent pr-5 text-[12px] text-gray-400 outline-none cursor-pointer"
              >
                <option value="">كل الفروع</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>

              <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* ================= QR MODAL ================= */}
      {openQR && <QRModal onClose={() => setOpenQR(false)} />}
    </>
  );
}

/* ===============================
   Small Components
   =============================== */
function IconBox({ icon }) {
  return (
    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 cursor-pointer hover:bg-gray-200">
      <Image src={icon} width={22} height={22} alt="icon" />
    </div>
  );
}
