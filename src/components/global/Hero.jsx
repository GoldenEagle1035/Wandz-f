import React from "react";
import Nav from "./Nav";
import { NavLink } from "react-router-dom";
import { MdArrowOutward } from "react-icons/md";
import VideoBG from "./VideoBG";


function Hero() {
  return (
    <div>
      <div className="mainpage">
        <VideoBG />
        <Nav btnText={"Select Profile"}/>
        <div className="hero-text-section container relative top-32 flex flex-col gap-10">
          <div className="w-5/6">
            <h1 className="text-[#CCCCCC] font-superLagendBoy text-[4.2rem] max-sm:text-[2.5rem] max-sm:p-2">
              <span className="text-gradient-bg">BORROW</span> &{" "}
              <span className="text-gradient-bg"> LEND </span>
              AGAINST YOUR NFT’s INSTANTLY
            </h1>
          </div> 
          <div className="buttons flex gap-10 max-sm:flex max-sm:flex-col max-sm:p-2 font-superLagendBoy">
            <NavLink to={"/borrow"}>
              <button className="px-10 py-4 border border-white text-[#DBFF00] text-2xl">
                Borrow
              </button>
            </NavLink>
            <NavLink to={"/lend"}>
              <button className="px-10 py-4 border border-[#DBFF00] text-2xl text-white bg-[#536223]">
                Lend
              </button>
            </NavLink>
          </div>

          <div className="box-section w-full backdrop-blur-2xl mt-24 max-sm:p-2 p-8 rounded-lg ">
              <div className="flex justify-between max-sm:flex max-sm:flex-col max-sm:items-start max-sm:gap-10 font-superLagendBoy">
                <div className="flex flex-col gap-2">
                  <h1 className="text-[#DBFF00] text-2xl">“DWØPE”</h1>
                  <h1 className="text-white text-lg">RELEASED ON LUKSO, MARCH 2024</h1>
                  <h1 className="text-white text-lg">PUBLIC LAUNCH IN APRIL</h1>
                </div>

                <div className="flex flex-col gap-2 justify-end items-end max-sm:items-start">
                  <p className="text-white text-lg">Make money as a lender, <br /> get cash as a borrower.</p>
                  <p className="text-[#DBFF00] flex gap-1 text-md items-center cursor-pointer">Read the bitepaper <span><MdArrowOutward size={22}/></span></p>
                </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hero;
