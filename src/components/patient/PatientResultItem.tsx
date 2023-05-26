import { FC, useState } from "react";

import { useNavigate } from "react-router-dom";

import Theme from "../../assets/color";

import nextIcon from "../../assets/icons/next_ico.svg";

import PatientResultItemIcon from "../../assets/icons/patient_thumbnail.svg";
import SelectedResultItemIcon from "../../assets/icons/selected_ico.svg";

interface PatientResultItemProps {
  name: string;
  newdiease: boolean;
  telephone: string;
  age: number;
  sex: number;
  doctor: string;
  date: string;
}

const PatientResultItem: FC<PatientResultItemProps> = ({
  name,
  newdiease,
  telephone,
  age,
  sex,
  doctor,
  date,
}) => {
  const navigate = useNavigate();

  const browsePatientDetail = () => {
    navigate("/patientdetail", {
      state: {
        name: name,
        newdiease: newdiease,
        telephone: telephone,
        age: age,
        sex: sex,
        doctor: doctor,
        date: date,
      },
    });
  };

  const [isLongClick, setIsLongClick] = useState(false);
  const [isPaidClick, setIsPaidClick] = useState(false);
  const [isHideCard, setIsHideCard] = useState(false);

  let timeout: NodeJS.Timeout;

  const handleMouseDown = () => {
    if (!isLongClick) {
      // setIsLongClick(false);
      timeout = setTimeout(() => {
        setIsLongClick(true);
      }, 1000); // set the duration of the long click here
    }
  };

  const handleMouseUp = () => {
    clearTimeout(timeout);
    // setIsLongClick(false);
  };

  return !isHideCard ? (
    <div
      className="my-3 shadow-lg rounded-xl"
      onClick={() => {
        // if (!isLongClick) browsePatientDetail();
      }}
    >
      <div className="relative h-full flex flex-col justify-center">
        {/* Image */}
        <div className="flex flex-row justify-center text-center">
          <div
            className="flex justify-center w-[72px]"
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onTouchStart={handleMouseDown}
            onTouchEnd={handleMouseUp}
          >
            {isLongClick ? (
              isPaidClick ? (
                <div
                  onClick={() => {
                    setIsPaidClick(false);
                    setIsLongClick(false);
                  }}
                  className="p-1"
                >
                  <img src={SelectedResultItemIcon} className="max-w-none" />
                </div>
              ) : (
                <div
                  className="w-[61px] h-[61px] m-1 border-2 border-[#25617B] bg-transparent rounded-full"
                  onClick={() => setIsPaidClick(true)}
                ></div>
              )
            ) : (
              <div className="h-[69px] flex justify-center items-center">
                <div>
                  <img
                    src={PatientResultItemIcon}
                    className="w-[26px] h-[35px] max-w-none"
                  />
                </div>
              </div>
            )}
          </div>
          {isPaidClick ? (
            <div
              className="grow bg-[#25617B] text-[36px] text-white text-center font-bold flex justify-center items-center rounded-tr-xl rounded-br-xl"
              onClick={() => setIsHideCard(true)}
            >
              <div>Paid</div>
            </div>
          ) : (
            <div
              className="grow flex flex-row justify-between items-center pb-3 text-xs text-left"
              onClick={() => browsePatientDetail()}
            >
              <div className="grow flex flex-row justify-between">
                <div>
                  <div style={{ color: Theme.COLOR_DEFAULT }}>{name}</div>
                  <div className="pt-1">
                    <span className="text-black">電話:</span>
                    <span className="text-black text-opacity-60">
                      {telephone}
                    </span>
                  </div>
                </div>
                <div className="text-black text-opacity-60">{date}</div>
              </div>
              <div className="p-2 flex justify-center">
                <img src={nextIcon} className="max-w-none" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  ) : (
    <></>
  );
};

export default PatientResultItem;
