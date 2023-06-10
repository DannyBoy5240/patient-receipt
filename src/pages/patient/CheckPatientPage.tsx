import { FC, useState, useEffect } from "react";

import { useNavigate, useLocation } from "react-router-dom";

import Theme from "../../assets/color";
import { BACKEND_URL } from "../../constants";

import nextIcon from "../../assets/icons/next_ico.svg";
import editIcon from "../../assets/icons/edit_ico.svg";
import editIcon1 from "../../assets/icons/edit_ico1.svg";
import editIcon2 from "../../assets/icons/edit_ico2.svg";
import downIcon from "../../assets/icons/down_ico.svg";
import profileImage from "../../assets/img/profile_sample.jpeg";
import prevvIcon from "../../assets/icons/prevv_ico.svg";
import nexttIcon from "../../assets/icons/nextt_ico.svg";
import blankImage from "../../assets/img/blank_image.svg";
import uploadIcon from "../../assets/icons/upload_ico.svg";
import cameraIcon from "../../assets/icons/camera_ico.svg";
import backwardIcon from "../../assets/icons/backward1_ico.svg";
import additemIcon from "../../assets/icons/additem_ico.svg";
import removeitemIcon from "../../assets/icons/removeitem_ico.svg";

import Header from "../../components/Header";
import NavBar from "../../components/NavBar";

interface MedicineInfo {
  name: string;
  amount: number;
}

const CheckPatient: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const _context = location.state.context;

  const [context, setContext] = useState(_context);

  const [isPastHistoryEditMode, setIsPastHistoryEditMode] = useState(false);
  const [isAccountTypeOpen, setIsAccountTypeOpen] = useState(false);

  const [storeMedicineInfo, setStoreMedicineInfo] = useState<MedicineInfo[]>(
    JSON.parse(_context.medicines)
  );

  const [currentSelect, setCurrentSelect] = useState(0);

  type PatientHistoryType = {
    date: string;
    detail: string;
    id: string;
  };
  const [patientHistory, setPatientHistory] = useState<PatientHistoryType[]>(
    []
  );
  const [originPatientHistory, setOriginPatientHistory] = useState<
    PatientHistoryType[]
  >([]);
  const [curHistoryViewState, setCurHistoryViewState] = useState(0);

  const [albumImages, setAlbumImages] = useState<string[]>([]);

  const getPatientHistory = async () => {
    const patientID = context.patientid;
    const doctorID = context.doctorid;
    const data = { patientID, doctorID };
    await fetch(BACKEND_URL + "/getpthistory", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => {
        setCurHistoryViewState(data.data.length - 1);
        setPatientHistory(data.data);
        setOriginPatientHistory(data.data);
      })
      .catch((error) => {
        console.error(error);
        // handle error
      });
  };

  const updateAlbumDataHandler = async () => {
    // update album data
    const cardid = _context.cardid;
    const data = { cardid };
    await fetch(BACKEND_URL + "/getptcardsbyid", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.data.length > 0) {
          setContext(data.data[0]);
          // analyze album images
          const albumImgText: string[] = data.data[0].album.split(", ");
          albumImgText.map((idx) => {
            console.log(idx);
          });
          setAlbumImages(albumImgText);
        }
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
      // fetch patient card information from backend
      getPatientHistory();
      // upate patient card context
      updateAlbumDataHandler();
    }
  }, [navigate]);

  useEffect(() => {
    updateMedicineDetail();
  }, [storeMedicineInfo]);

  const getUpdateRemark = (origin: any, newvalue: any, idx: any) => {
    const parts = origin.split("@@");
    parts[idx] = newvalue; // Replace the idx part
    const output = parts.join("@@");
    return output;
  };

  const updateMedicineDetail = () => {
    setContext((prevContext: any) => ({
      ...prevContext,
      medicines: JSON.stringify(storeMedicineInfo),
    }));
  };

  const updateCurrentPatientHistory = async () => {
    // update backend
    const cardID = _context.cardid;
    const originPtHistory = originPatientHistory[0].detail;
    const newPtHistory = patientHistory[0].detail;
    const data = { cardID, originPtHistory, newPtHistory };
    await fetch(BACKEND_URL + "/updatelastpthistory", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("last history updated successfully!");
      })
      .catch((error) => {
        console.error(error);
        // handle error
      });
  };

  const getOnlyDateTime = (dateString: any) => {
    const date = new Date(dateString);

    const formattedDate = `${("0" + date.getDate()).slice(-2)}-${(
      "0" +
      (date.getMonth() + 1)
    ).slice(-2)}-${date.getFullYear()} ${("0" + date.getHours()).slice(-2)}:${(
      "0" + date.getMinutes()
    ).slice(-2)}`;

    return formattedDate;
  };
  const getOnlyDate = (dateString: any) => {
    const date = new Date(dateString);

    const formattedDate = `${date.getDate()}/${
      date.getMonth() + 1
    }/${date.getFullYear()}`;

    return formattedDate;
  };
  const getOnlyDate1 = (dateString: any) => {
    const date = new Date(dateString);

    const day = ("0" + date.getUTCDate()).slice(-2); // using getUTCDate to avoid timezone issues
    const month = ("0" + (date.getUTCMonth() + 1)).slice(-2); // using getUTCMonth to avoid timezone issues
    const year = date.getUTCFullYear(); // using getUTCFullYear to avoid timezone issues

    const formattedDate = `${day}/${month}/${year}`;

    return formattedDate;
  };

  // File Uploading Functions
  const [files, setFiles] = useState<File[]>([]);
  const [loadFiles, setLoadFiles] = useState<string[]>([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const filesArray = Array.from(event.target.files);
      setFiles(filesArray);
      for (let i = 0; i < filesArray.length; i++) {
        const file = filesArray[i];
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          setLoadFiles((prevFiles) => [...prevFiles, reader.result as string]);
        };
      }
    }
  };

  return (
    <div className="relative">
      <div className="relative h-screen overflow-y-auto">
        {/* Header */}
        <div className="relative bg-[#64B3EC] h-28">
          <div className="flex flex-row justify-between w-full px-6 absolute text-center text-base text-white font-bold mt-8">
            <div className="flex flex-row items-center">
              <div onClick={() => navigate(-1)}>
                <img src={backwardIcon} className="max-w-none" />
              </div>
              <div className="pl-4">
                {context.name} ({context.sex == 1 ? "男" : "女"})
              </div>
            </div>
            <div>{context.age} 歲</div>
          </div>
          <div className="absolute bottom-[-8px] w-full h-8 bg-white rounded-xl"></div>
        </div>
        {/* Account Detail */}
        <div
          className="relative w-full mt-3 text-[13px] font-semibold pb-[160px]"
          style={{ color: Theme.COLOR_DEFAULT }}
        >
          <div className="flex flex-row justify-between font-normal px-3">
            {getOnlyDateTime(context.date)}
          </div>
          <div className="pt-2">
            {/* 既往史 */}
            <div>
              <div
                className="flex flex-row justify-between p-3 my-2 border-t border-b border-opacity-50 transform scale-y-10"
                onClick={() => {
                  setCurrentSelect(1);
                  getPatientHistory();
                }}
              >
                <div>既往史</div>
                <div className="flex flex-row justify-center">
                  <img src={downIcon} className="max-w-none" />
                </div>
              </div>
              {currentSelect == 1 ? (
                <div className="p-3 font-sans">
                  <div
                    className="flex flex-col p-4"
                    style={{
                      backgroundColor: Theme.COLOR_LIGHTBLUE,
                      color: Theme.COLOR_DARKGREEN,
                    }}
                  >
                    {patientHistory && patientHistory.length > 0 ? (
                      <textarea
                        className="w-full h-full focus:outline-none p-1 bg-transparent resize-none"
                        value={patientHistory[0].detail}
                        onChange={(ev) => {
                          const newDetail = ev.target.value;
                          setPatientHistory((prevHistory) => [
                            { ...prevHistory[0], detail: newDetail },
                            ...prevHistory.slice(1),
                          ]);
                        }}
                        readOnly={!isPastHistoryEditMode}
                      />
                    ) : (
                      <></>
                    )}
                    {patientHistory &&
                    patientHistory.length > 0 &&
                    !isPastHistoryEditMode ? (
                      <>
                        <div
                          className="pt-2 self-end"
                          onClick={() => setIsPastHistoryEditMode(true)}
                        >
                          <img src={editIcon2} className="max-w-none" />
                        </div>
                        <div className="pt-2 self-end">
                          Last update: {getOnlyDate(patientHistory[0].date)}
                        </div>
                      </>
                    ) : (
                      <></>
                    )}
                  </div>
                  {/*  */}
                  {isPastHistoryEditMode ? (
                    <div className="flex py-2 font-normal">
                      <div
                        className="grow p-3 rounded-lg text-center bg-[#D3E7F6]"
                        onClick={() => {
                          setIsPastHistoryEditMode(false);
                          setPatientHistory(originPatientHistory);
                        }}
                      >
                        Cancel
                      </div>
                      <div
                        className="grow p-3 ml-2 rounded-lg text-center text-white bg-[#64B3EC]"
                        onClick={() => {
                          setIsPastHistoryEditMode(false);
                          updateCurrentPatientHistory();
                        }}
                      >
                        Confirm
                      </div>
                    </div>
                  ) : (
                    <></>
                  )}
                </div>
              ) : (
                <></>
              )}
            </div>
            {/* 現病史 */}
            <div>
              <div
                className="flex flex-row justify-between p-3 my-2 border-t border-b border-opacity-50 transform scale-y-10"
                onClick={() => {
                  setCurrentSelect(2);
                  getPatientHistory();
                }}
              >
                <div>現病史</div>
                <div className="flex flex-row justify-center">
                  <img src={downIcon} className="max-w-none" />
                </div>
              </div>
              {currentSelect == 2 ? (
                <div className="p-3 font-sans">
                  {patientHistory ? (
                    <div className="flex flex-row">
                      {curHistoryViewState > 0 ? (
                        <div
                          className="flex flex-col justify-center p-1"
                          onClick={() =>
                            setCurHistoryViewState(
                              curHistoryViewState > 0
                                ? curHistoryViewState - 1
                                : 0
                            )
                          }
                        >
                          <img src={prevvIcon} className="max-w-none" />
                        </div>
                      ) : (
                        <div className="w-8"></div>
                      )}
                      {patientHistory && patientHistory[curHistoryViewState] ? (
                        <div
                          className="flex flex-col p-3 w-full"
                          style={{
                            backgroundColor: Theme.COLOR_LIGHTBLUE,
                            color: Theme.COLOR_DARKGREEN,
                          }}
                        >
                          <div>
                            {patientHistory[curHistoryViewState].detail}
                          </div>
                          <div className="pt-2 self-end">
                            Last update:{" "}
                            {getOnlyDate1(
                              patientHistory[curHistoryViewState].date
                            )}
                          </div>
                        </div>
                      ) : (
                        <></>
                      )}
                      {curHistoryViewState < patientHistory.length - 1 ? (
                        <div
                          className="flex flex-col justify-center p-1"
                          onClick={() =>
                            setCurHistoryViewState(
                              curHistoryViewState < patientHistory.length - 1
                                ? curHistoryViewState + 1
                                : patientHistory.length - 1
                            )
                          }
                        >
                          <img src={nexttIcon} className="max-w-none" />
                        </div>
                      ) : (
                        <div className="w-8"></div>
                      )}
                    </div>
                  ) : (
                    <></>
                  )}
                </div>
              ) : (
                <></>
              )}
            </div>
            {/* 病歷相簿 */}
            <div>
              <div
                className="flex flex-row justify-between p-3 my-2 border-t border-b border-opacity-50 transform scale-y-10"
                onClick={() => setCurrentSelect(3)}
              >
                <div>病歷相簿</div>
                <div className="flex flex-row justify-center">
                  <img src={downIcon} className="max-w-none" />
                </div>
              </div>
              {currentSelect == 3 ? (
                <div className="p-3">
                  <div className="font-sans flex flex-row justify-between">
                    {albumImages && albumImages.length > 1 ? (
                      <div className="flex flex-row overflow-x-auto">
                        {albumImages ? (
                          albumImages.map((idx, kkk) =>
                            kkk == 0 ? (
                              <></>
                            ) : (
                              <div
                                className="px-2"
                                onClick={() =>
                                  navigate("/editalbum", {
                                    state: { context: context },
                                  })
                                }
                              >
                                <img
                                  src={BACKEND_URL + "/uploads/" + idx}
                                  className="h-24 max-w-none"
                                />
                              </div>
                            )
                          )
                        ) : (
                          <></>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-row">
                        <div className="px-2">
                          <img src={blankImage} className="max-w-none" />
                        </div>
                        <div className="px-2">
                          <img src={blankImage} className="max-w-none" />
                        </div>
                      </div>
                    )}
                    <div className="flex flex-row items-end">
                      <div className="px-1 pb-1 flex items-center">
                        <div>
                          <label htmlFor="file-input" className="w-8 h-8">
                            <img src={uploadIcon} className="max-w-none" />
                          </label>
                          <input
                            id="file-input"
                            type="file"
                            onChange={handleFileChange}
                            style={{ display: "none" }}
                            accept="image/*"
                            multiple
                          />
                        </div>
                        <div className="px-1">
                          <img src={cameraIcon} className="max-w-none" />
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* New Uploaded Files Preview */}
                  {loadFiles.length > 0 ? (
                    <div className="pt-3 pb-0">
                      <div>New uploaded Album Images</div>
                      <div className="flex overflow-x-auto">
                        {loadFiles.map((file, idx) => (
                          <div className="px-1" key={"loadFilesImg" + idx}>
                            <img
                              src={file}
                              alt="uploaded file"
                              className="h-24 max-w-none"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <></>
                  )}
                  <div className="rounded-lg p-1 mt-2">
                    <input
                      className="w-full focus:outline-none p-2 rounded-lg bg-[#E8EEEC] text-[#276D36]"
                      value={context.albumtext}
                      onChange={(ev) => {
                        setContext((prevContext: any) => ({
                          ...prevContext,
                          albumtext: ev.target.value,
                        }));
                      }}
                    />
                  </div>
                </div>
              ) : (
                <></>
              )}
            </div>
            {/* 病名/證型 */}
            <div>
              <div
                className="flex flex-row justify-between p-3 my-2 border-t border-b border-opacity-50 transform scale-y-10"
                onClick={() => setCurrentSelect(4)}
              >
                <div>病名/證型</div>
                <div className="flex flex-row justify-center">
                  <img src={downIcon} className="max-w-none" />
                </div>
              </div>
              {currentSelect == 4 ? (
                <div className="p-3">
                  <div className="font-sans flex flex-row">
                    <div
                      className="w-full rounded-lg"
                      style={{ backgroundColor: Theme.COLOR_LIGHTBLUE }}
                    >
                      <input
                        className="w-full focus:outline-none p-2 rounded-lg"
                        style={{ backgroundColor: Theme.COLOR_LIGHTBLUE }}
                        value={context.disease}
                        onChange={(ev) => {
                          setContext((prevContext: any) => ({
                            ...prevContext,
                            disease: ev.target.value,
                          }));
                        }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <></>
              )}
            </div>
            {/* 診斷 */}
            <div>
              <div
                className="flex flex-row justify-between p-3 my-2 border-t border-b border-opacity-50 transform scale-y-10"
                onClick={() => setCurrentSelect(5)}
              >
                <div>診斷</div>
                <div className="flex flex-row justify-center">
                  <img src={downIcon} className="max-w-none" />
                </div>
              </div>
              {currentSelect == 5 ? (
                <div className="p-3">
                  <div className="font-sans flex flex-row">
                    <div
                      className="w-full rounded-lg"
                      style={{ backgroundColor: Theme.COLOR_LIGHTBLUE }}
                    >
                      <textarea
                        className="w-full h-[80px] resize-none focus:outline-none p-2 rounded-lg"
                        style={{ backgroundColor: Theme.COLOR_LIGHTBLUE }}
                        value={context.diagnosis}
                        onChange={(ev) => {
                          setContext((prevContext: any) => ({
                            ...prevContext,
                            diagnosis: ev.target.value,
                          }));
                        }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <></>
              )}
            </div>
            {/* 證型 */}
            <div>
              <div
                className="flex flex-row justify-between p-3 my-2 border-t border-b border-opacity-50 transform scale-y-10"
                onClick={() => setCurrentSelect(6)}
              >
                <div>證型</div>
                <div className="flex flex-row justify-center">
                  <img src={downIcon} className="max-w-none" />
                </div>
              </div>
              {currentSelect == 6 ? (
                <div className="p-3">
                  <div className="font-sans flex flex-row">
                    <div
                      className="w-full rounded-lg"
                      style={{ backgroundColor: Theme.COLOR_LIGHTBLUE }}
                    >
                      <textarea
                        className="w-full h-[80px] resize-none focus:outline-none p-2 rounded-lg"
                        style={{ backgroundColor: Theme.COLOR_LIGHTBLUE }}
                        value={context.syndromes}
                        onChange={(ev) => {
                          setContext((prevContext: any) => ({
                            ...prevContext,
                            syndromes: ev.target.value,
                          }));
                        }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <></>
              )}
            </div>
            {/* 方藥/穴位 */}
            <div>
              <div
                className="flex flex-row justify-between p-3 my-2 border-t border-b border-opacity-50 transform scale-y-10"
                onClick={() => setCurrentSelect(7)}
              >
                <div>方藥/穴位</div>
                <div className="flex flex-row justify-center">
                  <img src={downIcon} className="max-w-none" />
                </div>
              </div>
              {currentSelect == 7 ? (
                <div className="px-5 py-3">
                  <div className="flex flex-col">
                    {storeMedicineInfo.map((idx: any, kkk: any) => (
                      <div
                        className="flex flex-row justify-between py-2"
                        key={"medicinetype" + kkk}
                      >
                        <div className="grow">
                          <span className="p-2 bg-[#EAF4FB]">
                            <input
                              className="w-1/2 bg-[#EAF4FB] outline-none"
                              value={idx.name}
                              onChange={(ev) => {
                                setStoreMedicineInfo((prevState) => {
                                  const newState = [...prevState]; // create a copy of the array
                                  newState[kkk] = {
                                    ...newState[kkk],
                                    name: ev.target.value,
                                  }; // update the name property of the specified element
                                  return newState;
                                });
                              }}
                            />
                          </span>
                          <span className="p-2 ml-2 bg-[#EAF4FB]">
                            <input
                              className="w-1/4 bg-[#EAF4FB] outline-none"
                              value={idx.amount}
                              onChange={(ev) => {
                                setStoreMedicineInfo((prevState) => {
                                  const newState = [...prevState]; // create a copy of the array
                                  newState[kkk] = {
                                    ...newState[kkk],
                                    amount: parseInt(ev.target.value),
                                  }; // update the name property of the specified element
                                  return newState;
                                });
                              }}
                            />
                          </span>
                        </div>
                        <div
                          className="w-6 h-6"
                          onClick={() => {
                            setStoreMedicineInfo((prevState) =>
                              prevState.filter((_, i) => i !== kkk)
                            );
                          }}
                        >
                          <img
                            src={removeitemIcon}
                            className="w-6 h-6 max-w-none"
                          />
                        </div>
                      </div>
                    ))}
                    <div
                      className="flex flex-row justify-center"
                      onClick={() => {
                        setStoreMedicineInfo((prevState) => [
                          ...prevState,
                          { name: "XXX", amount: 0 },
                        ]);
                      }}
                    >
                      <img src={additemIcon} />
                    </div>
                  </div>
                </div>
              ) : (
                <></>
              )}
            </div>
            {/* 備註 */}
            <div>
              <div
                className="flex flex-row justify-between p-3 my-2 border-t border-b border-opacity-50 transform scale-y-10"
                onClick={() => setCurrentSelect(8)}
              >
                <div>備註</div>
                <div className="flex flex-row justify-center">
                  <img src={downIcon} className="max-w-none" />
                </div>
              </div>
              {currentSelect == 8 ? (
                <div className="p-3">
                  <div className="font-sans flex flex-row">
                    <div
                      className="w-full h-[80px] p-4"
                      style={{
                        backgroundColor: Theme.COLOR_LIGHTBLUE,
                        color: Theme.COLOR_DARKGREEN,
                      }}
                    >
                      <div>
                        <span className="px-1">
                          <input
                            className="w-12 focus:outline-none border-b border-b-[#25617B] bg-transparent"
                            value={context.remark.split("@@")[0]}
                            onChange={(ev) => {
                              setContext((prevContext: any) => ({
                                ...prevContext,
                                remark: getUpdateRemark(
                                  prevContext.remark,
                                  ev.target.value,
                                  0
                                ),
                              }));
                            }}
                          />
                        </span>
                        日藥 / 每日
                        <span className="px-1">
                          <input
                            className="w-12 focus:outline-none border-b border-b-[#25617B] bg-transparent"
                            value={context.remark.split("@@")[1]}
                            onChange={(ev) => {
                              setContext((prevContext: any) => ({
                                ...prevContext,
                                remark: getUpdateRemark(
                                  prevContext.remark,
                                  ev.target.value,
                                  1
                                ),
                              }));
                            }}
                          />
                        </span>
                        次 / 共
                        <span className="px-1">
                          <input
                            className="w-12 focus:outline-none border-b border-b-[#25617B] bg-transparent"
                            value={context.remark.split("@@")[2]}
                            onChange={(ev) => {
                              setContext((prevContext: any) => ({
                                ...prevContext,
                                remark: getUpdateRemark(
                                  prevContext.remark,
                                  ev.target.value,
                                  2
                                ),
                              }));
                            }}
                          />
                        </span>
                        包
                      </div>
                      <div className="pt-1">
                        <span className="px-1">
                          <input
                            className="w-12 focus:outline-none border-b border-b-[#25617B] bg-transparent"
                            value={context.remark.split("@@")[3]}
                            onChange={(ev) => {
                              setContext((prevContext: any) => ({
                                ...prevContext,
                                remark: getUpdateRemark(
                                  prevContext.remark,
                                  ev.target.value,
                                  3
                                ),
                              }));
                            }}
                          />
                        </span>
                        餐
                        <span className="px-1">
                          <input
                            className="w-12 focus:outline-none border-b border-b-[#25617B] bg-transparent"
                            value={context.remark.split("@@")[4]}
                            onChange={(ev) => {
                              setContext((prevContext: any) => ({
                                ...prevContext,
                                remark: getUpdateRemark(
                                  prevContext.remark,
                                  ev.target.value,
                                  4
                                ),
                              }));
                            }}
                          />
                        </span>
                        服
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <></>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Confirm */}
      <div className="absolute w-full px-3 bottom-[80px]">
        <div
          className="p-3 text-center text-white rounded-xl"
          style={{ backgroundColor: Theme.COLOR_DEFAULT }}
          onClick={() => {
            navigate("/previewmedicine", {
              state: { context: context, files: files },
            });
          }}
        >
          Confirm
        </div>
      </div>
      {/* NavBar */}
      <NavBar status={2} />
    </div>
  );
};

export default CheckPatient;
