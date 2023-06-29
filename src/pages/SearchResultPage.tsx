import { FC, useEffect, useState } from "react";

import { useNavigate, useLocation } from "react-router-dom";

import Theme from "../assets/color";
import { BACKEND_URL } from "../constants";

import Avatar1 from "../assets/avatar1.svg";
import DashBack from "../assets/img/alert_board.png";

import NavBar from "../components/NavBar";
import Header from "../components/Header";
import PatientResultItem from "../components/patient/PatientResultItem";

const SearchResultPage: FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const _context = location.state.context;
  const _searchText = location.state.searchtext;

  const [context, setContext] = useState(_context);

  const updateDateTimeFormat = (dateTimeString: any) => {
    const isoString = dateTimeString.toISOString();
    const formattedDate = isoString.replace("T", " ").replace(/\.\d+Z$/, "");
    return formattedDate;
  };

  const getSearchResultForPayment = async () => {
    const curDate = updateDateTimeFormat(new Date());
    const searchText = _searchText ? _searchText : "";
    const paidMode = 0;
    const data = { searchText, curDate, paidMode };
    await fetch(BACKEND_URL + "/getptcardpayment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Get searched patient card for payment successfully!");
        console.log("searched result -> ", data.data);
        if (data.data.length > 0) {
          // setContext(data.data.filter(
          //   (obj: any, index: any) =>
          //     data
          //       .slice(0, index)
          //       .every((otherObj: any) => JSON.stringify(obj) !== JSON.stringify(otherObj))
          // ));
          setContext(data.data);
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
      // update search result
      getSearchResultForPayment();
    }
  }, [navigate]);

  const showTextWithSearch = (searchText: string, fullText: string, maxLength: number): string => {
    // Escape special characters in the search text
    const escapedSearchText = searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
    // Create a regular expression with the escaped search text and case-insensitive flag
    const regex = new RegExp(`(${escapedSearchText})`, 'gi');
  
    // Find the first match index
    const match = regex.exec(fullText);
    if (!match) {
      // If no match is found, return the original fullText
      return fullText;
    }
  
    const matchIndex = match.index;
    const matchLength = match[0].length;
  
    // Calculate the start and end indices of the substring
    const startIndex = Math.max(matchIndex - Math.floor(maxLength / 2), 0);
    const endIndex = Math.min(startIndex + maxLength, fullText.length);
  
    // Get the substring centered around the matched text
    let substring = fullText.substring(startIndex, endIndex);
  
    // Highlight the matched text within the substring
    substring = substring.replace(regex, '<span class="text-red-500">$1</span>');
  
    // Add ellipsis if the substring does not start at the beginning of the full text
    if (startIndex > 0) {
      substring = `...${substring}`;
    }
  
    // Add ellipsis if the substring does not end at the end of the full text
    if (endIndex < fullText.length) {
      substring = `${substring}...`;
    }
  
    // Return the modified substring with HTML tags for highlighting
    return substring;
  }

  const getOnlyDate1 = (dateString: any) => {
    const date = new Date(dateString);

    const formattedDate = `${("0" + (date.getMonth() + 1)).slice(-2)}-${(
      "0" + date.getDate()
    ).slice(-2)}-${date.getFullYear()}`;

    return formattedDate;
  };

  return (
    <div className="relative">
      <div className="h-screen overflow-y-auto">
        {/* Header */}
        <Header title="Search Results" />
        {/* Main Page */}
        <div className="px-3">
          {/* Scheduled Patient List */}
          <div className="w-full">
            <div className="relative pb-[75px]">
              {context
                .sort(
                  (a: any, b: any) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                )
                .filter((obj: any, index: any, array: any) => {
                  const isUniqueCardId = array.findIndex((item: any) => item.cardid === obj.cardid) === index;                
                  return isUniqueCardId;
                })
                // .filter((obj: any, index: number, array: any) => {
                //   console.log("---", obj.patientid, "---", obj.detail, "***", obj.detail.toString().includes(_searchText));
                //   return !array.some((item: any, itemIndex: number) => {
                //     return itemIndex !== index && item.patientid === obj.patientid && item.detail === obj.detail && (obj.detail && obj.detail.toString().includes(_searchText));
                //   });
                // })
                .filter((obj: any, index: any, array: any) => {
                  console.log("*", obj);
                  if (obj.name && obj.name.toString().includes(_searchText) && array.slice(0, index-1).some((idx: any) => idx.name && idx.name.includes(_searchText)))  return false;
                  if (obj.engname && obj.engname.toString().includes(_searchText) && array.slice(0, index-1).some((idx: any) => idx.engname && idx.engname.includes(_searchText)))  return false;
                  if (obj.birthday && obj.birthday.toString().includes(_searchText) && array.slice(0, index-1).some((idx: any) => idx.birthday && idx.birthday.includes(_searchText)))  return false;
                  if (obj.telephone && obj.telephone.toString().includes(_searchText) && array.slice(0, index-1).some((idx: any) => idx.telephone && idx.telephone.includes(_searchText)))  return false;
                  if (obj.address && obj.address.toString().includes(_searchText) && array.slice(0, index-1).some((idx: any) => idx.address && idx.address.includes(_searchText)))  return false;
                  if (obj.emergency && obj.emergency.toString().includes(_searchText) && array.slice(0, index-1).some((idx: any) => idx.emergency && idx.emergency.includes(_searchText)))  return false;
                  if (obj.emergencynumber && obj.emergencynumber.toString().includes(_searchText) && array.slice(0, index-1).some((idx: any) => idx.emergencynumber && idx.emergencynumber.includes(_searchText)))  return false;
                  if (obj.doctorid && obj.doctorid.toString().includes(_searchText) && array.slice(0, index-1).some((idx: any) => idx.doctorid && idx.doctorid.includes(_searchText)))  return false;
                  if (obj.date && obj.date.toString().includes(_searchText) && array.slice(0, index-1).some((idx: any) => idx.date && idx.date.includes(_searchText)))  return false;
                  if (obj.disease && obj.disease.toString().includes(_searchText) && array.slice(0, index-1).some((idx: any) => idx.disease && idx.disease.includes(_searchText)))  return false;
                  if (obj.syndromes && obj.syndromes.toString().includes(_searchText) && array.slice(0, index-1).some((idx: any) => idx.syndromes && idx.syndromes.includes(_searchText)))  return false;
                  if (obj.medicines && obj.medicines.toString().includes(_searchText) && array.slice(0, index-1).some((idx: any) => idx.medicines && idx.medicines.includes(_searchText)))  return false;
                  if (obj.albumtext && obj.albumtext.toString().includes(_searchText) && array.slice(0, index-1).some((idx: any) => idx.albumtext && idx.albumtext.includes(_searchText)))  return false;
                  if (obj.toll && obj.toll.toString().includes(_searchText) && array.slice(0, index-1).some((idx: any) => idx.toll && idx.toll.includes(_searchText)))  return false;
                  if (obj.receipt && obj.receipt.toString().includes(_searchText) && array.slice(0, index-1).some((idx: any) => idx.receipt && idx.receipt.includes(_searchText)))  return false;
                  if (obj.prescription && obj.prescription.toString().includes(_searchText) && array.slice(0, index-1).some((idx: any) => idx.prescription && idx.prescription.includes(_searchText)))  return false;
                  if (obj.pasthistory && obj.pasthistory.toString().includes(_searchText) && array.slice(0, index-1).some((idx: any) => idx.pasthistory && idx.pasthistory.includes(_searchText)))  return false;
                  if (obj.pasthistorydate && obj.pasthistorydate.toString().includes(_searchText) && array.slice(0, index-1).some((idx: any) => idx.pasthistorydate && idx.pasthistorydate.includes(_searchText)))  return false;
                  if (obj.detail && obj.detail.toString().includes(_searchText) && array.slice(0, index-1).some((idx: any) => idx.detail && idx.detail.includes(_searchText) && obj.patientid == idx.patientid))  return false;
                  return true;
                })
                .map((idx: any, kkk: any) => (
                  <div
                    className="absolute p-4 rounded-xl border border-[#D3E7F6] shadow-lg bg-white w-full"
                    key={idx.date + kkk}
                    style={{ top: kkk * 75 + 20, zIndex: kkk }}
                    onClick={() => {
                      
                      idx.name && idx.name.toString().includes(_searchText) || idx.engname && idx.engname.toString().includes(_searchText) ||
                         idx.birthday && idx.birthday.toString().includes(_searchText) || idx.patientid && idx.patientid.toString().includes(_searchText) ||
                         idx.telephone && idx.telephone.toString().includes(_searchText) || idx.address && idx.address.toString().includes(_searchText) ||
                         idx.emergency && idx.emergency.toString().includes(_searchText) || idx.emergencynumber && idx.emergencynumber.toString().includes(_searchText) ||
                         idx.doctorid && idx.doctorid.toString().includes(_searchText) || idx.doctor && idx.doctor.toString().includes(_searchText) ?
                            navigate("/patientdetail", {
                              state: {
                                cardid: idx.cardid,
                                date: idx.date,
                              },
                            })
                      : idx.date && idx.date.toString().includes(_searchText) ||
                          idx.disease && idx.disease.toString().includes(_searchText) || idx.diagnosis && idx.diagnosis.toString().includes(_searchText) ||
                          idx.syndromes && idx.syndromes.toString().includes(_searchText) || idx.medicines && idx.medicines.toString().includes(_searchText) ?
                            navigate("/recipe", {
                              state: {
                                context: idx,
                              },
                            })
                      : idx.albumtext && idx.albumtext.toString().includes(_searchText) ?
                            navigate("/patientalbum", {
                              state: {
                                context: idx,
                                searchtext: _searchText,
                              },
                            })
                      : idx.toll && idx.toll.toString().includes(_searchText) || idx.receipt && idx.receipt.toString().includes(_searchText) ?
                            navigate("/receipt", {
                              state: {
                                context: idx,
                              },
                            })
                      : idx.prescription && idx.prescription.toString().includes(_searchText) ?
                            navigate("/prescription", {
                              state: {
                                context: idx,
                              },
                            })
                      : idx.pasthistory && idx.pasthistory.toString().includes(_searchText) || idx.pasthistorydate && idx.pasthistorydate.toString().includes(_searchText) ?
                            navigate("/pasthistory", {
                              state: {
                                context: idx,
                              },
                            })
                      : idx.detail && idx.detail.toString().includes(_searchText) || idx.details && idx.details.toString().includes(_searchText) ?
                            navigate("/patientrecord", {
                              state: {
                                context: idx,
                                searchtext: idx.detail,
                              },
                            })
                      : console.log("no matches!");
                    }}
                  >
                    <div>
                      診症日期：
                      <span className="px-1">{getOnlyDate1(idx.date)}</span>
                    </div>
                    {
                      idx.name && idx.name.toString().includes(_searchText) ?
                        <div className="flex flex-row p-3">
                          <div className="pr-3 w-[100px]">中文姓名</div>
                          <div
                            style={{ width: "100%", overflowWrap: "break-word" }}
                            dangerouslySetInnerHTML={{ __html: showTextWithSearch(_searchText, idx.name, 20) }}
                          >
                          </div>
                        </div>
                      : null
                    }
                    {
                      idx.engname && idx.engname.toString().includes(_searchText) ?
                        <div className="flex flex-row p-3">
                          <div className="pr-3 w-[100px]">英文姓名</div>
                          <div
                            style={{ width: "100%", overflowWrap: "break-word" }}
                            dangerouslySetInnerHTML={{ __html: showTextWithSearch(_searchText, idx.engname, 20) }}
                          >
                          </div>
                        </div>
                      : null
                    }
                    {
                      idx.birthday && idx.birthday.toString().includes(_searchText) ?
                        <div className="flex flex-row p-3">
                          <div className="pr-3 w-[100px]">出生日期</div>
                          <div
                            style={{ width: "100%", overflowWrap: "break-word" }}
                            dangerouslySetInnerHTML={{ __html: showTextWithSearch(_searchText, idx.birthday, 20) }}
                          >
                          </div>
                        </div>
                      : null
                    }
                    {
                      idx.patientid && idx.patientid.toString().includes(_searchText) ?
                        <div className="flex flex-row p-3">
                          <div className="pr-3 w-[100px]">身份證號碼</div>
                          <div
                            style={{ width: "100%", overflowWrap: "break-word" }}
                            dangerouslySetInnerHTML={{ __html: showTextWithSearch(_searchText, idx.patientid, 20) }}
                          >
                          </div>
                        </div>
                      : null
                    }
                    {
                      idx.telephone && idx.telephone.toString().includes(_searchText) ?
                        <div className="flex flex-row p-3">
                          <div className="pr-3 w-[100px]">電話號碼</div>
                          <div
                            style={{ width: "100%", overflowWrap: "break-word" }}
                            dangerouslySetInnerHTML={{ __html: showTextWithSearch(_searchText, idx.telephone, 20) }}
                          >
                          </div>
                        </div>
                      : null
                    }
                    {
                      idx.address && idx.address.toString().includes(_searchText) ?
                        <div className="flex flex-row p-3">
                          <div className="pr-3 w-[100px]">地址</div>
                          <div
                            style={{ width: "100%", overflowWrap: "break-word" }}
                            dangerouslySetInnerHTML={{ __html: showTextWithSearch(_searchText, idx.address, 20) }}
                          >
                          </div>
                        </div>
                      : null
                    }
                    {
                      idx.emergency && idx.emergency.toString().includes(_searchText) ?
                        <div className="flex flex-row p-3">
                          <div className="pr-3 w-[100px]">緊急聯絡人</div>
                          <div
                            style={{ width: "100%", overflowWrap: "break-word" }}
                            dangerouslySetInnerHTML={{ __html: showTextWithSearch(_searchText, idx.emergency, 20) }}
                          >
                          </div>
                        </div>
                      : null
                    }
                    {
                      idx.emergencynumber && idx.emergencynumber.toString().includes(_searchText) ?
                        <div className="flex flex-row p-3">
                          <div className="pr-3 w-[100px]">緊急聯絡人電話</div>
                          <div
                            style={{ width: "100%", overflowWrap: "break-word" }}
                            dangerouslySetInnerHTML={{ __html: showTextWithSearch(_searchText, idx.emergencynumber, 20) }}
                          >
                          </div>
                        </div>
                      : null
                    }
                    {
                      idx.doctorid && idx.doctorid.toString().includes(_searchText) ?
                        <div className="flex flex-row p-3">
                          <div className="pr-3 w-[100px]">DoctorID</div>
                          <div
                            style={{ width: "100%", overflowWrap: "break-word" }}
                            dangerouslySetInnerHTML={{ __html: showTextWithSearch(_searchText, idx.doctorid, 20) }}
                          >
                          </div>
                        </div>
                      : null
                    }
                    {
                      idx.doctor && idx.doctor.toString().includes(_searchText) ?
                        <div className="flex flex-row p-3">
                          <div className="pr-3 w-[100px]">医生</div>
                          <div
                            style={{ width: "100%", overflowWrap: "break-word" }}
                            dangerouslySetInnerHTML={{ __html: showTextWithSearch(_searchText, idx.doctor, 20) }}
                          >
                          </div>
                        </div>
                      : null
                    }
                    {
                      idx.date && idx.date.toString().includes(_searchText) ?
                        <div className="flex flex-row p-3">
                          <div className="pr-3 w-[100px]">預約到診日期</div>
                          <div
                            style={{ width: "100%", overflowWrap: "break-word" }}
                            dangerouslySetInnerHTML={{ __html: showTextWithSearch(_searchText, idx.date, 20) }}
                          >
                          </div>
                        </div>
                      : null
                    }
                    {
                      idx.albumtext && idx.albumtext.toString().includes(_searchText) ?
                        <div className="flex flex-row p-3">
                          <div className="pr-3 w-[100px]">病歷相簿</div>
                          <div
                            style={{ width: "100%", overflowWrap: "break-word" }}
                            dangerouslySetInnerHTML={{ __html: showTextWithSearch(_searchText, idx.albumtext, 20) }}
                          >
                          </div>
                        </div>
                      : null
                    }
                    {
                      idx.disease && idx.disease.toString().includes(_searchText) ?
                        <div className="flex flex-row p-3">
                          <div className="pr-3 w-[100px]">疾病</div>
                          <div
                            style={{ width: "100%", overflowWrap: "break-word" }}
                            dangerouslySetInnerHTML={{ __html: showTextWithSearch(_searchText, idx.disease, 20) }}
                          >
                          </div>
                        </div>
                      : null
                    }
                    {
                      idx.diagnosis && idx.diagnosis.toString().includes(_searchText) ?
                        <div className="flex flex-row p-3">
                          <div className="pr-3 w-[100px]">診斷</div>
                          <div
                            style={{ width: "100%", overflowWrap: "break-word" }}
                            dangerouslySetInnerHTML={{ __html: showTextWithSearch(_searchText, idx.diagnosis, 20) }}
                          >
                          </div>
                        </div>
                      : null
                    }
                    {
                      idx.syndromes && idx.syndromes.toString().includes(_searchText) ?
                        <div className="flex flex-row p-3">
                          <div className="pr-3 w-[100px]">證型</div>
                          <div
                            style={{ width: "100%", overflowWrap: "break-word" }}
                            dangerouslySetInnerHTML={{ __html: showTextWithSearch(_searchText, idx.syndromes, 20) }}
                          >
                          </div>
                        </div>
                      : null
                    }
                    {
                      idx.medicines && idx.medicines.toString().includes(_searchText) ?
                        <div className="flex flex-row p-3">
                          <div className="pr-3 w-[100px]">方藥/穴位</div>
                          <div
                            style={{ width: "100%", overflowWrap: "break-word" }}
                            dangerouslySetInnerHTML={{ __html: showTextWithSearch(_searchText, idx.medicines, 20) }}
                          >
                          </div>
                        </div>
                      : null
                    }
                    {
                      idx.toll && idx.toll.toString().includes(_searchText) ?
                        <div className="flex flex-row p-3">
                          <div className="pr-3 w-[100px]">收費</div>
                          <div
                            style={{ width: "100%", overflowWrap: "break-word" }}
                            dangerouslySetInnerHTML={{ __html: showTextWithSearch(_searchText, idx.toll, 20) }}
                          >
                          </div>
                        </div>
                      : null
                    }
                    {
                      idx.receipt && idx.receipt.toString().includes(_searchText) ?
                        <div className="flex flex-row p-3">
                          <div className="pr-3 w-[100px]">收據</div>
                          <div
                            style={{ width: "100%", overflowWrap: "break-word" }}
                            dangerouslySetInnerHTML={{ __html: showTextWithSearch(_searchText, idx.receipt, 20) }}
                          >
                          </div>
                        </div>
                      : null
                    }
                    {
                      idx.prescription && idx.prescription.toString().includes(_searchText) ?
                        <div className="flex flex-row p-3">
                          <div className="pr-3 w-[100px]">到診證明書</div>
                          <div
                            style={{ width: "100%", overflowWrap: "break-word" }}
                            dangerouslySetInnerHTML={{ __html: showTextWithSearch(_searchText, idx.prescription, 20) }}
                          >
                          </div>
                        </div>
                      : null
                    }
                    {
                      idx.pasthistory && idx.pasthistory.toString().includes(_searchText) ?
                        <div className="flex flex-row p-3">
                          <div className="pr-3 w-[100px]">既往史</div>
                          <div
                            style={{ width: "100%", overflowWrap: "break-word" }}
                            dangerouslySetInnerHTML={{ __html: showTextWithSearch(_searchText, idx.pasthistory, 20) }}
                          >
                          </div>
                        </div>
                      : null
                    }
                    {
                      idx.pasthistorydate && idx.pasthistorydate.toString().includes(_searchText) ?
                        <div className="flex flex-row p-3">
                          <div className="pr-3 w-[100px]">既往史日期</div>
                          <div
                            style={{ width: "100%", overflowWrap: "break-word" }}
                            dangerouslySetInnerHTML={{ __html: showTextWithSearch(_searchText, idx.pasthistorydate, 20) }}
                          >
                          </div>
                        </div>
                      : null
                    }
                    {
                      idx.detail && idx.detail.toString().includes(_searchText) ?
                        <div className="flex flex-row p-3">
                          <div className="pr-3 w-[100px]">現病史</div>
                          <div
                            style={{ width: "100%", overflowWrap: "break-word" }}
                            dangerouslySetInnerHTML={{ __html: showTextWithSearch(_searchText, idx.detail, 20) }}
                          >
                          </div>
                        </div>
                      : <div className="p-3"></div>
                    }
                  </div>
                ))}
            </div>
          </div>
        </div>
        {/* NavBar */}
        <NavBar status={3} />
      </div>
    </div>
  );
};

export default SearchResultPage;
