import React, { useState } from "react";
import "./nav.css";
import MobileNav from "./MobileNav";
import { MdMenu } from "react-icons/md";
import { RxCross1 } from "react-icons/rx";
import { NavLink, useLocation } from "react-router-dom";
import Button from "./Button";
import Bg from "../../assets/background/video.webp";
import { RainbowKitCustomConnectButton } from "../wandz-eth";
import { useAccount } from 'wagmi';
import { useLoans } from "../../hooks/wandz-eth";

function Nav({ btnText }) {
  const [showMenu, setShowMenu] = useState(false);
  const location = useLocation();

  const account = useAccount();

  const loans = useLoans();

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const links = [
    {
      id: 1,
      link: "LEND",
    },
    {
      id: 2,
      link: "OFFERS",
    },
    {
      id: 3,
      link: "BORROW",
    },
    {
      id: 4,
      link: "LOANS",
    },
  ];

  return (
    <div className="">
      <div className="relative pt-4 w-full ">
        <div className="container flex items-center justify-between nav-responsive">
          <div className="mx-auto md:mx-0 relative flex text-center items-center font-twist text-3xl md:text-5xl tracking-tighter lg:w-2/6">
            <div className="relative">
              <div className="relative">
                <h1 className="logo-mask font-twist text-6xl sm:text-6xl md:text-6xl">
                  WANDZ
                </h1>
              </div>
              <div className="absolute bottom-1 left-1 text-6xl md:text-6xl max-sm:text-6xl">
                <NavLink to={"/"} duration={500}>
                  <h1 className="font-twist text-[#E4E4E4]">WANDZ</h1>
                </NavLink>
              </div>
            </div>
          </div>
          <div className="right-nav md:hidden">
            <div className="flex items-center">
              <button className="burger-menu md:hidden">
                {showMenu ? (
                  <RxCross1 onClick={toggleMenu} size={50} color="white" />
                ) : (
                  <MdMenu onClick={toggleMenu} size={50} color="white" />
                )}
              </button>
            </div>
          </div>
          <div className="hidden md:flex md:flex-1 md:justify-end md:items-center md:gap-8">
            <div className="nav-container">
              <div className="nav-items  ul items-center flex gap-8 font-superLagendBoy text-[#FFFFFF]">
                {links.map(({ link, id }) => (
                  <div key={id}>
                    <NavLink
                      to={"/" + link}
                      duration={500}
                    >
                      <a 
                      className={`text-lg ${(loans.loans.filter((loan) => loan.lender.toLowerCase() == account.address.toLowerCase() && loan.amount != 0 && !loan.accepted && !loan.paid && !loan.liquidated).length == 0 && link=="OFFERS") || (loans.loans.filter((loan) => loan.borrower.toLowerCase() == account.address.toLowerCase() && loan.accepted && !loan.paid && !loan.liquidated).length == 0 && link=="LOANS") ? "text-[#ffffff80]" : "text-white"}`}
                      >{link}</a>
                    </NavLink>
                    {location.pathname === `/${link}` && (
                      <div className="h-[4px] w-full bg-[#DBFF00]" />
                      // <video
                      //   className="h-[4px] w-full object-cover"
                      //   src={Bg}
                      //   type="video/webm"
                      //   autoPlay
                      //   muted
                      //   loop
                      // />
                    )}
                  </div>
                ))}
                <div className="nav-btn">
                  <div style={{ position: "relative", width: "fit-content" }}>
                    <RainbowKitCustomConnectButton />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showMenu ? <MobileNav showMenu={showMenu} /> : null}
    </div>
  );
}

export default Nav;
