import { FC, useState, useEffect } from "react";

import { useNavigate, useLocation } from "react-router-dom";

import html2canvas from 'html2canvas';
import jsPDF from "jspdf";

import Theme from "../../assets/color";
import { BACKEND_URL } from "../../constants";

import editIcon from "../../assets/icons/edit_ico1.svg";
import shareIcon from "../../assets/icons/share_ico.svg";
import printIcon from "../../assets/icons/print_ico.svg";

import NavBar from "../../components/NavBar";
import Header from "../../components/Header";

interface MedicineType {
  name: string;
  amount: number;
}

interface CompanyInfoType {
  logo: string;
  address: string;
  tel: string;
}

interface Props {
  email: string;
  phone: string;
}

const RecipePage: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const _context = location.state.context;

  const [isFollowedUp, setIsFollowedUp] = useState(true);

  const [context, setContext] = useState({});

  const [curName, setCurName] = useState("");
  const [curDiagnosis, setCurDiagnosis] = useState("");
  const [curDoctorName, setCurDoctorName] = useState("");
  const [curDoctorID, setCurDoctorID] = useState("");
  const [curMedicines, setCurMedicines] = useState<MedicineType[]>([]);
  const [chunkMedicines, setChunkMedicines] = useState<MedicineType[][]>([]);
  const [remarks, setRemarks] = useState([]);

  const chunkArray = (arr: MedicineType[], chunkSize: number) => {
    const chunks = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
      chunks.push(arr.slice(i, i + chunkSize));
    }
    return chunks;
  };

  const getRecipeData = async () => {
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
        console.log("Get Patient Detail by ID successfully!");
        if (data.data.length > 0) {
          // update current receipt
          setContext(data.data[0]);
          console.log("context -> ", data.data[0]);

          const temp = data.data[0];
          setCurName(temp.name);
          setCurDiagnosis(temp.diagnosis);
          setCurDoctorName(temp.doctor);
          setCurDoctorID(temp.doctorid);
          setCurMedicines(temp.medicines ? JSON.parse(temp.medicines) : []);
          setChunkMedicines(
            temp.medicines ? chunkArray(JSON.parse(temp.medicines), 3) : []
          );
          setRemarks(temp.remark.split("@@").length == 6 ? temp.remark.split("@@") : [])
        }
      })
      .catch((error) => {
        console.error(error);
        // handle error
      });
  };

  const [companyInfo, setCompanyInfo] = useState<CompanyInfoType>({
    logo: "",
    address: "",
    tel: "",
  });

  const getCompanyInfo = async () => {
    //  get company info
    await fetch(BACKEND_URL + "/getcompanyinfo", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setCompanyInfo(data.data[0]);
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
      // get patient data
      getRecipeData();
      // get company profile
      getCompanyInfo();
    }
  }, [navigate]);

  const getOnlyDate1 = (dateString: any) => {
    const date = new Date(dateString);

    const formattedDate = `${("0" + (date.getMonth() + 1)).slice(-2)}-${(
      "0" + date.getDate()
    ).slice(-2)}-${date.getFullYear()}`;

    return formattedDate;
  };

  const printHandler = () => {
    
    // window.print();

    const element = document.getElementById('recipe');
    if (!element) return;

    html2canvas(element).then((canvas) => {
      // Convert the canvas to a data URL representing the captured screenshot
      const screenshotDataUrl = canvas.toDataURL("image/jpeg");

      // Create a new jsPDF instance
      const pdf = new jsPDF();

      // Calculate the dimensions of the PDF page based on the captured screenshot
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const aspectRatio = canvas.width / canvas.height;
      let imgWidth = pageWidth;
      let imgHeight = imgWidth / aspectRatio;

      let marginLeft = 0;
      const marginTop = 0;

      // Adjust the dimensions if the captured screenshot is taller than the PDF page
      if (imgHeight > pageHeight) {
        imgHeight = pageHeight;
        imgWidth = imgHeight * aspectRatio;
        marginLeft = (pageWidth - imgWidth) / 2;
      }

      // Add the captured screenshot image to the PDF
      pdf.addImage(screenshotDataUrl, "JPEG", marginLeft, marginTop, imgWidth, imgHeight);

      // File name generate
      const currentDate = new Date().toISOString().slice(0, 10);
      const fileName = `prescription_${curName}_${currentDate}.pdf`;

      // Save the PDF file
      pdf.save(fileName);
    });
  };

  const [isOpenShare, setIsOpenShare] = useState(false);

  const shareOnSocialHandler = async (mode: any) => {
    try {
      // Capture the screenshot of the entire document body
      const canvas = await html2canvas(document.body, {
        scrollX: 0,
        scrollY: -window.scrollY,
        windowWidth: document.documentElement.clientWidth,
        windowHeight: document.documentElement.clientHeight,
      });
      const screenshotDataUrl = canvas.toDataURL();

      if (mode == 1) {  // Email Share
        // Generate the mailto URL with the pre-filled email content
        const subject = encodeURIComponent('Check out this screenshot!');
        const body = encodeURIComponent('<p>Here is the screenshot:</p><img src="' + screenshotDataUrl + '">');
        const mailtoUrl = `mailto:?subject=${subject}&body=${body}`;

        // Open a new window with the mailto URL
        const newWindow = window.open(mailtoUrl, '_blank');

        // If the new window fails to open, fallback to window.location.href
        if (!newWindow) {
          window.location.href = mailtoUrl;
        }
      } else {  // WhatsApp Share
        // Generate the base64-encoded image data
        const imageData = screenshotDataUrl.replace(/^data:image\/(png|jpeg);base64,/, '');

        // Construct the WhatsApp share URL with the pre-filled image data
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent('Check out this screenshot:')}&media=${encodeURIComponent(imageData)}`;

        // Open a new window with the WhatsApp share URL
        const newWindow = window.open(whatsappUrl, '_blank');

        // If the new window fails to open, fallback to the WhatsApp web URL
        if (!newWindow) {
          window.location.href = whatsappUrl;
        }
      }
    } catch (error) {
      console.log('Error capturing or sharing the screenshot by email:', error);
    }
  };

  return (
    <div className="relative">
      <div className="h-screen overflow-y-auto bg-[#FAFCFF]">
        {/* Header */}
        <Header title="到診證明書" />
        {/* Main Page */}
        <div className="m-4 p-3 rounded-lg shadow-lg bg-white" id="recipe">
          {/* Title */}
          <div className="text-center">
            <div
              className="font-bold font-sans text-5xl"
              style={{ color: Theme.COLOR_DEFAULT }}
            >
              {companyInfo.logo}
            </div>
            <div
              className="font-bold text-lg pt-5"
              style={{ color: Theme.COLOR_DEFAULT }}
            >
              <span className="border-b border-b-[#64B3EC]">處方</span>
            </div>
          </div>
          {/* User Info */}
          <div>
            <div className="text-sm p-2 mt-3 pb-5 border-b border-b-[#64B3EC]">
              <div className="py-1">
                <span style={{ color: Theme.COLOR_DEFAULT }}>診症日期:</span>
                <span className="pl-2 text-black text-opacity-60">
                  {getOnlyDate1(_context.date)}
                </span>
              </div>
              <div className="py-1">
                <span style={{ color: Theme.COLOR_DEFAULT }}>病人姓名:</span>
                <span className="pl-2 text-black text-opacity-60">
                  {curName}
                </span>
              </div>
              <div className="py-1">
                <div style={{ color: Theme.COLOR_DEFAULT }}>診斷: <span className="pl-1">{curDiagnosis}</span></div>
                <div className="px-2 pt-4 pb-2 h-48 text-black text-xs">
                  <table className="table w-11/12 mx-auto border-collapse border border-black">
                    <tbody>
                      {chunkMedicines.map((chunk, i) => (
                        <tr key={i} className="align-middle">
                          {chunk.map((medicine, j) => (
                            <td
                              key={j}
                              className="border border-black p-2 text-center w-1/3"
                            >
                              {medicine.name} {medicine.amount}g
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="text-xs text-[#666666]">
                  <span className="text-black">{remarks.length > 0 ? remarks[0] : ""}</span><span className="px-1">日藥/每日</span>
                  <span className="text-black">{remarks.length > 0 ? remarks[1] : ""}</span><span className="px-1">次/共</span>
                  <span className="text-black">{remarks.length > 0 ? remarks[2] : ""}</span><span className="px-1">包</span>
                </div>
                <div className="text-xs text-[#666666] pt-3">
                  <span className="text-black">{remarks.length > 0 ? remarks[3] : ""}</span><span className="px-1">餐</span>
                  <span className="text-black">{remarks.length > 0 ? remarks[4] : ""}</span><span className="px-1">服</span>
                </div>
              </div>
              {/* Diagnosis */}
              <div
                className="py-1 pt-3 text-black text-opacity-60"
                style={{ color: Theme.COLOR_DEFAULT }}
              >
                <span>主診醫師：</span>
                <span>{curDoctorName}</span>
              </div>
              <div className="pb-1 text-black text-opacity-60 flex flex-row justify-between">
                <div>
                  <span>醫師編號:</span>
                  <span className="pl-2">{curDoctorID}</span>
                </div>
                {/* <div className="flex flex-row">
                  <div
                    className="relative w-[18px] h-[18px] hover:cursor-pointer"
                    style={{
                      background: !isFollowedUp ? Theme.COLOR_DEFAULT : "",
                    }}
                    onClick={() => setIsFollowedUp(!isFollowedUp)}
                  >
                    {isFollowedUp ? (
                      <img
                        src={checkIcon}
                        className="absolute top-0 left-0 w-[18px] h-[18px]"
                      />
                    ) : (
                      <></>
                    )}
                  </div>
                  <div
                    className="text-[13px] pl-2"
                    style={{ color: Theme.COLOR_DEFAULT }}
                  >
                    需要覆診
                  </div>
                </div> */}
              </div>
            </div>
            <div
              className="p-3 text-xs flex justify-between"
              style={{ color: Theme.COLOR_DEFAULT }}
            >
              <div>地址: {companyInfo.address}</div>
              <div>電話: {companyInfo.tel}</div>
            </div>
          </div>
        </div>
        {/* Assistant Tools */}
        <div className="mb-[70px] p-4 flex flex-row justify-end">
          <div
            className="p-3"
            onClick={() =>
              navigate("/checkpatient", { state: { context: context } })
            }
          >
            <img src={editIcon} className="max-w-none" />
          </div>
          <div className="relative p-3">
            <div onClick={() => setIsOpenShare(!isOpenShare)}>
              <img src={shareIcon} className="max-w-none" />
            </div>
            {
              isOpenShare ?
                <div className="absolute top-[-15px] left-[-20px] text-xs flex flex-row">
                  <div className="p-1 hover:bg-[#D3E7F6] text-[#64B3EC]" onClick={() => shareOnSocialHandler(1)}>Email</div>
                  <div className="p-1 hover:bg-[#D3E7F6] text-[#64B3EC]" onClick={() => shareOnSocialHandler(2)}>WhatsApp</div>
                </div>
              : <></>
            }
          </div>
          <div className="p-3" onClick={() => printHandler()}>
            <img src={printIcon} className="max-w-none" />
          </div>
        </div>
        {/* NavBar */}
        <NavBar status={4} />
      </div>
    </div>
  );
};

export default RecipePage;
