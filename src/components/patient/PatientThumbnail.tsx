import { FC, useState } from "react";

import { useNavigate } from "react-router-dom";

import closeIcon from "../../assets/icons/close_ico1.svg";
import subMenuItemIcon from "../../assets/icons/submenu_item_ico.svg";

import Theme from "../../assets/color";

import patientThumbnailIcon from "../../assets/icons/patient_thumbnail.svg";

interface PatientThumbnailProps {
  name: string;
  newdiease: boolean;
  telephone: string;
  age: number;
  sex: number;
  doctor: string;
  date: string;
}

const PatientThumbnail: FC<PatientThumbnailProps> = ({
  name,
  newdiease,
  telephone,
  age,
  sex,
  doctor,
  date,
}) => {
  const navigate = useNavigate();

  const [isCheckPatientOpen, setIsCheckPatientOpen] = useState(false);
  const [isOpenItemMenu, setIsOpenItemMenu] = useState(false);
  const [isItemDeleteOpen, setIsItemDeleteOpen] = useState(false);
  const [isItemDeleted, setIsItemDeleted] = useState(false);

  return (
    <div className={isItemDeleted ? "hidden" : "block"}>
      <div
        className="px-2 py-4 my-3 shadow-lg rounded-xl hover:bg-[#D3E7F6]"
        onClick={() => setIsCheckPatientOpen(true)}
      >
        <div className="relative h-32 flex">
          {/* Image */}
          <div className="w-1/3 flex flex-col justify-center text-center">
            <div className="flex justify-center">
              <img src={patientThumbnailIcon} className="max-w-none" />
            </div>
            <div
              className="text-sm pt-2"
              style={{ color: Theme.COLOR_DEFAULT }}
            >
              {name}
            </div>
            <div
              className="text-xs pt-1"
              style={{ color: Theme.COLOR_SELECTED }}
            >
              {newdiease ? "新症" : ""}
            </div>
          </div>
          {/* Content */}
          <div className="w-2/3 text-xs">
            <div>
              <span>電話 ：</span>
              <span className="text-black text-opacity-60">{telephone}</span>
            </div>
            <div>
              <span>年齡 ：</span>
              <span className="text-black text-opacity-60">{age}</span>
            </div>
            <div>
              <span>性別 ：</span>
              <span className="text-black text-opacity-60">
                {sex == 1 ? "男" : "女"}
              </span>
            </div>
          </div>
          {/* Note */}
          <div className="absolute bottom-1 right-4 text-xs">
            <div>
              <span>主診醫師: </span>
              <span className="text-black text-opacity-60">{doctor}</span>
            </div>
            <div>{date}</div>
          </div>
          {/* Top-Right Sub Menu Item */}
          <div
            className="absolute right-1 top-0 w-3 h-3 z-20 flex flex-col justify-center"
            onClick={() => setIsOpenItemMenu(true)}
          >
            <div className="relative">
              <img src={subMenuItemIcon} className="max-w-none" />
              {isOpenItemMenu ? (
                <div className="absolute top-2 right-1 text-[#64B3EC] text-[11px] border border-[#64B3EC] w-20">
                  <div
                    className="w-full px-3 py-1 border-b border-b-[#64B3EC] hover:bg-[#D3E7F6]"
                    onClick={() => navigate("/checkpatient")}
                  >
                    Edit
                  </div>
                  <div
                    className="w-full px-3 py-1 hover:bg-[#D3E7F6]"
                    onClick={() => setIsItemDeleteOpen(true)}
                  >
                    Delete
                  </div>
                </div>
              ) : (
                <></>
              )}
            </div>
          </div>
        </div>
      </div>
      {isCheckPatientOpen && !isOpenItemMenu ? (
        <div className="absolute w-full h-full bg-[#AAAAAAAA] z-20 top-0 left-0 flex flex-col justify-center">
          <div className="relative m-3 px-9 py-5 bg-[#D3E7F6] rounded-lg text-[#25617B]">
            <div className="flex flex-row bg-[#D3E7F6] bg-opacity-40 font-sans font-bold text-sm">
              <div>{name}</div>
              <div className="pl-2">{telephone}</div>
            </div>
            <div
              className="absolute top-5 right-5"
              onClick={() => setIsCheckPatientOpen(false)}
            >
              <img src={closeIcon} className="max-w-none" />
            </div>
            <div className="text-xs">預約時間：DD/MM/YYYY HH:MM</div>
            <div
              className="text-xl font-bold text-center tracking-[.75rem] pl-2 py-2 border border-[#25617B] rounded-lg mt-3"
              onClick={() => navigate("/checkpatient")}
            >
              開始診斷
            </div>
            <div
              className="text-xl font-bold text-center tracking-[.75rem] pl-2 py-2 border border-[#25617B] rounded-lg mt-3"
              onClick={() => {
                navigate("/pastpatientrecord", {
                  state: {
                    name: "張小梅",
                    newdiease: true,
                    telephone: "A12345678(9)",
                    age: 38,
                    sex: 1,
                    doctor: "張大玉",
                    date: "9-9-2022",
                  },
                });
              }}
            >
              查閱病歷
            </div>
          </div>
        </div>
      ) : (
        <></>
      )}
      {isItemDeleteOpen ? (
        <div className="absolute w-full h-full bg-[#AAAAAAAA] z-20 top-0 left-0 flex flex-col justify-center">
          <div className="relative m-3 px-9 py-5 bg-[#D3E7F6] rounded-lg text-[#25617B]">
            <div className="flex flex-row bg-[#D3E7F6] bg-opacity-40 font-sans font-bold text-sm justify-center">
              <div>{name}</div>
              <div className="pl-2">{telephone}</div>
            </div>
            <div
              className="absolute top-5 right-5"
              onClick={() => setIsCheckPatientOpen(false)}
            >
              <img src={closeIcon} className="max-w-none" />
            </div>
            <div className="text-xs text-center">
              預約時間：DD/MM/YYYY HH:MM
            </div>
            <div
              className="text-xl font-bold text-center tracking-[.75rem] pl-2 py-2 border border-[#25617B] rounded-lg mt-3"
              onClick={() => {
                setIsItemDeleted(true);
                setIsItemDeleteOpen(false);
              }}
            >
              取消預約
            </div>
          </div>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};

export default PatientThumbnail;
