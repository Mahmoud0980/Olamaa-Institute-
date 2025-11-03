import { useDispatch, useSelector } from "react-redux";
import { setSelectedBranchId } from "../../redux/Slices/instituteBranchesSlice";
import Image from "next/image";
import { ChevronDown } from "lucide-react";

export default function Navbar({ branches }) {
  const dispatch = useDispatch();
  const selectedBranchId = useSelector(
    (state) => state.branches.selectedBranchId
  );
  return (
    <div className="flex items-center justify-between p-4">
      <div className="hidden lg:flex items-center gap-2 text-xl rounded-lg shadow-md bg-[#F3F3F3] px-2">
        <Image
          src={"/search.svg"}
          width={24}
          height={24}
          alt=""
          priority
          quality={80}
          className="bg-[#F3F3F3]"
        />
        <input
          type="text"
          placeholder="البحث"
          className="w-[231px] xl:w-[446px] h-[50px] p-2 outline-none text-[20px] bg-[#F3F3F3]"
        />
      </div>
      <div className="flex items-center gap-6 justify-end w-full">
        <div className="rounded-full w-7 h-7 flex items-center justify-center cursor-pointer">
          <Image src={"/notification.svg"} width={24} height={25} alt="" />
        </div>
        <div className="rounded-full w-7 h-7 flex items-center justify-center cursor-pointer relative">
          <Image src={"/message.svg"} width={20} height={20} alt="" />
          {/* <div className="absolute -top-3 -right-3 w-5 h-5 flex items-center justify-center bg-purple-500 text-white rounded-full text-xs">
            1
          </div> */}
        </div>

        <Image
          src={"/avatar.svg"}
          width={55}
          height={55}
          className="rounded-full"
          alt=""
        />
        <div className="flex flex-col">
          <span className="text-[13px] md:text-[16px] leading-3 font-[500px]]">
            {" "}
            المشرفة راما الأحمد
          </span>
          <div
            className="
    relative flex items-center gap-2 text-sm
    ring-gray-300 px-2 py-1 shrink-0 text-[#999999]
  "
            dir="rtl" // تأكد من RTL
          >
            <select
              className="
      w-full bg-transparent outline-none text-sm
      appearance-none pr-5 pl-2 text-right
    "
              value={selectedBranchId}
              onChange={(e) =>
                dispatch(setSelectedBranchId(Number(e.target.value) || ""))
              }
            >
              <option value="" className="bg-[#F3F3F3] border-none">
                كل الفروع
              </option>
              {branches.map((b) => (
                <option key={b.id} value={b.id} className="bg-[#F3F3F3]">
                  {b.name}
                </option>
              ))}
            </select>

            <ChevronDown
              className="
      pointer-events-none absolute right top-1/2 -translate-y-1/2
      w-4 h-4 text-[#999999]
    "
            />
          </div>
        </div>
      </div>
    </div>
  );
}
