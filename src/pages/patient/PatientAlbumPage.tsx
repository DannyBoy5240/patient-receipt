import { FC, useState, useEffect, useRef } from "react";

import { useNavigate, useLocation } from "react-router-dom";

import Theme from "../../assets/color";
import { BACKEND_URL } from "../../constants";

import Avatar1 from "../../assets/avatar1.svg";
import DashBack from "../../assets/img/alert_board.png";
import editIcon from "../../assets/icons/edit_ico1.svg";
import uploadIcon from "../../assets/icons/upload_ico.svg";
import cameraIcon from "../../assets/icons/camera_ico.svg";
import BlankImage from "../../assets/img/blank_image.svg";

import NavBar from "../../components/NavBar";
import Header from "../../components/Header";
import PatientResultItem from "../../components/patient/PatientResultItem";

const PatientAlbumPage: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const context = location.state.context;

  const [patientCardList, setPatientCardList] = useState([]);

  const getPatientAlbumHistory = async () => {
    const patientID = context.patientid;
    const data = { patientID };
    await fetch(BACKEND_URL + "/getptcardbypatientid", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Get Patient Detail by patientID successfully!");
        if (data.data.length > 0) setPatientCardList(data.data);
      })
      .catch((error) => {
        console.error(error);
        // handle error
      });
  };

  // Hook for User Authentication
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      // Redirect to login page if token is not present
      navigate("/");
    } else {
      if (context) getPatientAlbumHistory();
    }
  }, [navigate]);

  const getOnlyDate1 = (dateString: any) => {
    const date = new Date(dateString);

    const formattedDate = `${("0" + (date.getMonth() + 1)).slice(-2)}-${(
      "0" + date.getDate()
    ).slice(-2)}-${date.getFullYear()}`;

    return formattedDate;
  };

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string>("");
  const [isCapturing, setIsCapturing] = useState(false);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        canvasRef.current.toBlob(
          (blob: any) => {
            if (blob) {
              const file = new File([blob], "photo.jpg", {
                type: "image/jpeg",
              });
              const filesArray = [file];
              const shareData = {
                files: filesArray,
              };
              navigator.share(shareData);
            }
          },
          "image/jpeg",
          1
        );
      }
    }
  };

  const captureCameraImageHandler = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCapturing(true);
        handleCapture();
      }
    } catch (error) {
      setError("Error accessing camera");
    }
  };

  const getCalcAge = (birthdate: string) => {
    const today = new Date();
    const birthdateObj = new Date(birthdate);
    let age = today.getFullYear() - birthdateObj.getFullYear();
    const monthDiff = today.getMonth() - birthdateObj.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthdateObj.getDate())
    ) {
      age--;
    }
    return age;
  };

  return (
    <div className="relative">
      <div className="h-screen overflow-y-auto">
        {/* Header */}
        <Header title="病歷相簿" />
        {/* Main Page */}
        <div className="p-4">
          {/* Title */}
          <div className="flex flex-row justify-between">
            <div
              className="flex flex-row text-base font-bold"
              style={{ color: Theme.COLOR_DEFAULT }}
            >
              <div>
                {context ? context.name : ""} (
                {context ? (context.sex == 1 ? "男" : "女") : ""})
              </div>
              <div className="pl-3">{context ? getCalcAge(context.birthday) : ""} 歲</div>
            </div>
            {/* <div className="text-sm text-[#0C2036] text-opacity-80">
              {context ? getOnlyDate1(context.date) : ""}
            </div> */}
          </div>
          {/* Content */}
          <div
            className="text-xs pt-5 px-3 pb-[80px]"
            style={{ color: Theme.COLOR_DEFAULT }}
          >
            {patientCardList
              .sort(
                (a: any, b: any) =>
                  new Date(b.date).getTime() - new Date(a.date).getTime()
              )
              .filter(
                (lst: any) =>
                  new Date().getTime() > new Date(lst.date).getTime()
              )
              .map((idx: any, kkk: any) =>
                idx.album && idx.album.split(", ").length > 0 ? (
                  <div className="relative py-2" key={"ptcardlist" + kkk}>
                    <div className="text-[#64B3EC] text-sm font-bold py-1">
                      {getOnlyDate1(idx.date)}
                    </div>
                    <div className="text-[#276D36] px-2">{idx.albumtext}</div>
                    <div className="flex flex-row pt-2 justify-between">
                      {idx.album ? (
                        <div className="flex flex-row overflow-x-auto">
                          {idx.album.split(", ").map((idxx: any, kkkk: any) =>
                            kkkk !== 0 ? (
                              <div
                                className="px-2"
                                onClick={() => {
                                  navigate("/editalbum", {
                                    state: {
                                      context: idx,
                                      context_extra: context,
                                    },
                                  });
                                }}
                                key={"kkkk" + kkkk}
                              >
                                <img
                                  src={BACKEND_URL + "/uploads/" + idxx}
                                  className="h-24 max-w-none"
                                />
                              </div>
                            ) : (
                              <div key={"kkkk" + kkkk}></div>
                            )
                          )}
                        </div>
                      ) : (
                        <></>
                      )}
                    </div>
                  </div>
                ) : (
                  <div key={"ptcardlist" + kkk}></div>
                )
              )}
          </div>
        </div>
        {/* NavBar */}
        <NavBar status={4} />
      </div>
    </div>
  );
};

export default PatientAlbumPage;
