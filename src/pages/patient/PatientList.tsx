import { FC } from "react";

import Theme from "../../assets/color";

import Avatar1 from "../../assets/avatar1.svg";
import DashBack from "../../assets/img/alert_board.png";

import NavBar from "../../components/NavBar";
import Header from "../../components/Header";
import PatientThumbnail from "../../components/patient/PatientThumbnail";

const PatientList: FC = () => {
  const temp_db = [
    {
      name: "陳小明",
      newdiease: true,
      telephone: "671234561",
      age: 52,
      sex: 1,
      doctor: "黃文智醫師",
      date: "9-9-2022 / 10:30 a.m.",
    },
    {
      name: "陳小明",
      newdiease: false,
      telephone: "671234562",
      age: 52,
      sex: 1,
      doctor: "黃文智醫",
      date: "9-9-2022 / 10:30 a.m.",
    },
    {
      name: "陳小明",
      newdiease: true,
      telephone: "671234563",
      age: 52,
      sex: 1,
      doctor: "黃文醫師",
      date: "9-9-2022 / 10:30 a.m.",
    },
    {
      name: "陳小明",
      newdiease: true,
      telephone: "671234564",
      age: 52,
      sex: 1,
      doctor: "黃文醫師",
      date: "9-9-2022 / 10:30 a.m.",
    },
    {
      name: "陳小明",
      newdiease: true,
      telephone: "671234565",
      age: 52,
      sex: 1,
      doctor: "黃文醫師",
      date: "9-9-2022 / 10:30 a.m.",
    },
    {
      name: "陳小明",
      newdiease: true,
      telephone: "671234566",
      age: 52,
      sex: 1,
      doctor: "黃文醫師",
      date: "9-9-2022 / 10:30 a.m.",
    },
  ];

  return (
    <div className="relative">
      <div className="h-screen overflow-y-auto">
        {/* Header */}
        <Header title="Patient Schedule" />
        {/* Main Page */}
        <div className="px-3">
          {/* Scheduled Patient List */}
          <div className="w-full">
            <div className="pb-[75px]">
              {temp_db.map((idx: any) => (
                <PatientThumbnail
                  key={idx.name + idx.telephone + idx.doctor}
                  name={idx.name}
                  newdiease={idx.newdiease}
                  telephone={idx.telephone}
                  age={idx.age}
                  sex={idx.sex}
                  doctor={idx.doctor}
                  date={idx.date}
                />
              ))}
            </div>
          </div>
        </div>
        {/* NavBar */}
        <NavBar status={2} />
      </div>
    </div>
  );
};

export default PatientList;