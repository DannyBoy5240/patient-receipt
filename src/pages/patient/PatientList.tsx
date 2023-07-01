import { FC, useState, useEffect } from "react";

import { useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../../constants";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import Theme from "../../assets/color";

import Avatar1 from "../../assets/avatar1.svg";
import DashBack from "../../assets/img/alert_board.png";

import NavBar from "../../components/NavBar";
import Header from "../../components/Header";
import PatientThumbnail from "../../components/patient/PatientThumbnail";

interface UserData {
  username: string;
}

const PatientList: FC = () => {
  const navigate = useNavigate();

  const [userData, setUserData] = useState<UserData | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [cardsArray, setCardsArray] = useState([]);

  const getOnlyDate = (dateString: any) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const day = ("0" + date.getDate()).slice(-2);
    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
  };

  const getSchedulePatientCards = async (user: any, viewDate: any) => {
    const doctorID = user.doctorid;
    // fetch scheduled cards of selected date
    const data = { doctorID };
    await fetch(BACKEND_URL + "/getptcardsbydate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => {
        const filteredData = data.data.filter((item: any) => {
          const itemDate = new Date(item.date);
          return item.checked == 0 && viewDate && viewDate.split("-").length > 0 && 
                 itemDate.getDate() == viewDate.split("-")[2] &&
                 (itemDate.getMonth()+1) == parseInt(viewDate.split("-")[1]) &&
                 itemDate.getFullYear() == viewDate.split("-")[0];
        });
        setCardsArray(filteredData);
      })
      .catch((error) => {
        console.error(error);
        // handle error
      });
  };

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      // Redirect to login page if token is not present
      navigate("/");
    } else {
      setUserData(JSON.parse(token).user);
      // fetch patient card information from backend
      getSchedulePatientCards(
        JSON.parse(token).user,
        getOnlyDate(selectedDate)
      );
    }
  }, [selectedDate, navigate]);

  return (
    <div className="relative">
      <div className="h-screen overflow-y-auto">
        {/* Header */}
        <Header title="Patient Schedule" />
        {/* Main Page */}
        <div className="px-3">
          {/* Date Selection Field */}
          <div className="flex pt-2 text-sm text-[#0C2036] font-bold justify-center">
            <DatePicker
              selected={selectedDate}
              onChange={(date: Date | null) => {
                setSelectedDate(date);
              }}
              dateFormat="MM-dd-yyyy"
              className="px-3 py-2 rounded-md border-gray-300 flex text-center focus:outline-none"
            />
          </div>
          {/* Scheduled Patient List */}
          <div className="w-full">
            <div className="pb-[75px]">
              {cardsArray.filter((item: any) => {
                return item.checked == 0;
              }).map((idx: any, kkk: any) => (
                <PatientThumbnail
                  key={"thumbnail" + idx.name + kkk}
                  context={idx}
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
