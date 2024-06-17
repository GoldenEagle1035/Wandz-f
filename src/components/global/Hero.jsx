import React from "react";
import Nav from "./Nav";
import { NavLink } from "react-router-dom";
import VideoBG from "./VideoBG";


function Hero() {
  return (
    <div>
      <div className="mainpage">
        <VideoBG />
        <Nav btnText={"Select Profile"} />
        <div className="hero-text-section container relative top-32 flex flex-col gap-10">
          <div className="w-5/6">
            <h1 className="text-[#CCCCCC] font-superLagendBoy text-[4.2rem] max-sm:text-[2rem] max-sm:p-2">
              <span className="text-gradient-bg">BORROW</span> &{" "}
              <span className="text-gradient-bg"> LEND </span>
              AGAINST YOUR NFTs INSTANTLY
            </h1>
          </div>
          <div className="buttons flex gap-10 max-sm:flex max-sm:flex-col max-sm:p-2 font-superLagendBoy">
            <NavLink to={"/borrow"}>
              <button className="px-10 py-4 border border-white text-[#DBFF00] text-2xl max-sm:text-xl">
                Borrow
              </button>
            </NavLink>
            <NavLink to={"/lend"}>
              <button className="px-10 py-4 border border-[#DBFF00] text-2xl max-sm:text-xl text-white bg-[#536223]">
                Lend
              </button>
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hero;
