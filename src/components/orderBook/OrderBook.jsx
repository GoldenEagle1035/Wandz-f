import React from "react";
import VideoBG from "../global/VideoBG";
import Nav from "../global/Nav";
import { FiSearch, FiFilter } from "react-icons/fi";
import Filter from "../../assets/icons/Filter.png";
import { tableData,tableLoanData } from "../data/data";

function OrderBook() {
  const datas = [
    {
        title:"TOTAL INTEREST (FROM ACTIVE LOANS)",
        price:"0",
        statusValue:"0",
        status:"active loans"

    },
    {
        title:"TOTAL ACTIVE LOANS",
        price:"0",
        statusValue:"",
        status:"",

    },
    {
        title:"LOANS IN 24H/12H",
        price:"1225/1375",
        statusValue:"",
        status:"",

    },
    {
        title:"ACTIVE LOANS VOLUME",
        price:"0",
        statusValue:'0 in 24H <br/> 0 in 7D',
        status:"", 

    },
    {
      title:"TOTAL VALUE LOCKED",
      price:"0",
      statusValue:"",
      status:""
  },
]
  return (
    <div className="lend-section">
    <div className="main-page">
      {/* <VideoBG /> */}
      <Nav btnText={"Select Profile"} />

      <div className="container relative pt-36" >
        <div className="boxes ">

          <div className="flex max-sm:flex-col max-sm:gap-4 justify-between">
          {datas.map((item,index)=>
            <div className="text-[#FFFFFF] mx-4 rounded-lg border border-[#DBFF00] border-b-4 font-superLagendBoy flex-wrap backdrop-blur-3xl p-6 py-6 flex flex-col justify-between">
              <h1 className="text-[10px]">
                {item.title}
              </h1>
              <div className="flex flex-col justify-between mt-2">
                <h1 className="flex gap-1">
                  <span>Ŀ</span>
                  <span>{item.price}</span>
                </h1>
                <div className="text-[10px]" dangerouslySetInnerHTML={{ __html: item.statusValue}} />
                <span className="text-[10px]">{item.status} </span>
              </div>
            </div>
            )}
          </div>

          </div>
        <div className="table-sec pt-24">
          <div className="sf flex justify-between items-center max-sm:flex max-sm:flex-col max-sm:gap-2 max-sm:items-start">
            <div className="relative">
              <input
                type="text"
                placeholder="Search here"
                className="font-superLagendBoy bg-transparent placeholder-white text-white border border-[#DBFF00] rounded-lg py-1 pl-10"
              />
              <FiSearch
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white"
                size={20}
              />
            </div>
            <div className="filters">
              <button className="flex font-superLagendBoy text-white  gap-2 justify-center border border-[#DBFF00] rounded-lg p-1 px-2">
                <img src={Filter} alt="filter-option" />
                <h1 className="text-sm">Filter</h1>
              </button>
            </div>
          </div>
          <div className="px-6  overflow-x-auto backdrop-blur-xl text-left font-superLagendBoy text-[#FFFFFF] my-12 rounded-xl border-none">
            <table className="w-full">
              <thead>
                <tr className="max-sm:text-[11px] text-[12px]">
                  <th className="px-4 py-2">IMAGE</th>
                  <th className="px-4 py-2">NAME</th>
                  <th className="px-4 py-2">ACTIVE LOANS</th>
                  <th className="px-4 py-2">LOANS in 24H</th>
                  <th className="px-4 py-2">OFFERS</th>
                  <th className="px-4 py-2">FLOOR</th>
                  <th className="px-4 py-2">LTV</th>
                  <th className="px-4 py-2">LIQUIDITY</th>
                  <th className="px-4 py-2">FORECLOSURES</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {tableLoanData.map((item, index) => (
                  <tr className=" py-10 border-b-[1px] border-[#a9a9a9d8]  ">
                    <td className="p-4 px-4 flex gap-2 items-center">
                      <span>
                        <img src={item.avatar} alt="" />
                      </span>
                      
                    </td>
                    <td className="px-4 text-[12px] max-sm:text-[11px]">
                    {item.collection}
                      <br />
                      <span className="text-[9px] text-[#B5B5B5]">
                        {item.collectionPer}
                      </span>
                    </td>
                    <td className="px-4 text-[12px] max-sm:text-[11px]">
                      {item.activeLoans} <br />
                      <span className="text-[9px] text-[#B5B5B5]">
                        {item.LoanActive}
                      </span>{" "}
                    </td>
                    <td className="px-4 text-[12px] max-sm:text-[11px]">
                    {item.loanIn24}
                      <br />
                      <span className="text-[9px] text-[#B5B5B5]">
                        {item.loanIn24Paid}
                      </span>
                    </td>
                    <td className="px-4 text-[12px] max-sm:text-[11px]">
                    {item.offerToken}                      
                    </td>
                    <td className="px-4 text-[12px] max-sm:text-[11px]">
                    <span className="text-lg mr-1">Ŀ</span>
                    {item.floor}                      
                    </td>
                    <td className="px-4 text-[12px] max-sm:text-[11px]">
                    {item.ltv}                      
                    </td>
                    <td className="px-4 text-[12px] max-sm:text-[11px]">
                      <span className="text-lg mr-1">Ŀ</span>
                    {item.liq}
                      <br />
                      <span className="text-[9px] text-[#B5B5B5]">
                        {item.liqPrice}
                      </span>
                    </td>

                    <td className="px-4 text-[12px] max-sm:text-[11px]">
                    {item.forClosure}
                      <br />
                      <span className="text-[9px] text-[#B5B5B5]">
                        {item.forResult}
                      </span>
                    </td>

                    <td className="text-[12px] max-sm:text-[11px]">{item.apy}</td>
                    <td className="text-[12px] max-sm:text-[11px]">{item.duration}</td>
                    <td><button className="bg-gradient-to-r from-[#159F2C] text-black px-4 py-2 text-[12px] max-sm:text-[11px] rounded-lg to-[#DBFF00]">LEND</button></td>
                    <br />
                  
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
  )
}

export default OrderBook