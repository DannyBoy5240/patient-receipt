import { FC } from "react";

import { useNavigate } from "react-router-dom";

import backwardIcon from "../assets/icons/backward_ico.svg";

interface HeaderProps {
  title: string;
}

const Header: FC<HeaderProps> = ({ title }) => {
  const navigate = useNavigate();

  return (
    <div className="relative h-28">
      <div className="relative w-full bg-[#64B3EC] h-28 text-center text-base text-white font-semibold pt-8">
        <div className="pt-1">
          {title == "-到診證明書" ? "到診證明書" : title}
        </div>
        {title != "Sign In" && title != "-到診證明書" ? (
          <div
            className="absolute left-4 top-8 border border-white p-2 rounded-md"
            onClick={() => navigate(-1)}
          >
            <img src={backwardIcon} className="max-w-none" />
          </div>
        ) : (
          <></>
        )}
      </div>
      <div className="absolute bottom-[-8px] w-full h-8 bg-white rounded-xl"></div>
    </div>
  );
};

export default Header;
