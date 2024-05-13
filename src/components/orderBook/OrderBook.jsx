import React, { useState, useContext } from "react";
import VideoBG from "../global/VideoBG";
import Nav from "../global/Nav";
import { FiSearch, FiFilter } from "react-icons/fi";
import Filter from "../../assets/icons/Filter.png";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import LendDlgBanner from "../../assets/background/lendDlgBanner.png";

import { useAccount } from 'wagmi';
import { parseEther, formatUnits } from 'viem';

import { LoansContext } from "../../context/loan-context";
import { CollectionsContext } from "../../context/collection-context";

// import { collections } from "../../data/collections";

function OrderBook() {

  const [selectedLend, setSelectedLend] = useState(-1);
  const [offerAmount, setOfferAmount] = useState('');
  const [totalInvest, setTotalInvest] = useState('');
  const [numberOffers, setNumberOffers] = useState(1);
  const [placeOfferPending, setPlaceOfferPending] = useState(false);

  const [searchValue, setSearchValue] = useState('');

  const account = useAccount();

  const loans = useContext(LoansContext);
  const { collections, isLoading: isLoadingCollection } = useContext(CollectionsContext);

  const onPlaceOffer = (lendIndex) => {
    setOfferAmount('');
    setTotalInvest('');
    setNumberOffers(1);
    setSelectedLend(lendIndex);
  }

  const placeOffer = async () => {
    if (account.address) {
      setPlaceOfferPending(true);
      try {
        const result = await loans.offerLoan({
          args: [
            collections[selectedLend].address,
            collections[selectedLend].duration,
            parseEther(offerAmount, "wei"),
            collections[selectedLend].interest,
            numberOffers
          ],
          value: parseEther(totalInvest),
          from: account.address
        })
        console.log("offerLoan:", result);
      } catch (error) {
        console.log(error);
      }
      setPlaceOfferPending(false);
      setSelectedLend(-1);
    }
  }

  return (
    <>
      <div className="lend-section">
        <div className="main-page">
          {/* <VideoBG /> */}
          <Nav btnText={"Select Profile"} />

          <div className="container relative pt-36" >
            <div className="boxes ">

              <div className="flex max-sm:flex-col max-sm:gap-4 justify-between">
                <div className="text-[#FFFFFF] rounded-lg border border-[#DBFF00] border-b-[6px] font-superLagendBoy backdrop-blur-3xl p-6 py-6 pr-10 flex flex-col">
                  <h1 className="text-[10px]">
                    TOTAL INTEREST EARNED (ALL TIME)
                  </h1>
                  <div className="flex flex-col justify-between mt-4">
                    <h1 className="flex gap-2 items-center">
                      <span className="text-xl">{loans.loans.filter((loan) => loan.amount != 0 && !loan.accepted && loan.paid && !loan.liquidated).reduce((total, loan) => total + loan.amount * (loan.interest / 10 - 100) / 100, 0)}</span>
                      <span className="text-3xl">LYX</span>
                    </h1>
                    <span className="text-[10px]">{loans.loans.filter((loan) => loan.amount != 0 && !loan.accepted && loan.paid && !loan.liquidated).length} completed loans</span>
                  </div>
                </div>
                <div className="text-[#FFFFFF] rounded-lg border border-[#DBFF00] border-b-[6px] font-superLagendBoy backdrop-blur-3xl p-6 py-6 pr-10 flex flex-col">
                  <h1 className="text-[10px]">
                    TOTAL ACTIVE LOAN VALUE
                  </h1>
                  <div className="flex flex-col justify-between mt-4">
                    <h1 className="flex gap-2 items-center">
                      <span className="text-xl">{formatUnits(loans.loans.filter((loan) => loan.amount != 0 && loan.accepted && !loan.paid && !loan.liquidated).reduce((total, loan) => total + loan.amount, 0), 18)}</span>
                      <span className="text-3xl">LYX</span>
                    </h1>
                    <span className="text-[10px]">{loans.loans.filter((loan) => loan.amount != 0 && loan.accepted && !loan.paid && !loan.liquidated).length} active loans</span>
                  </div>
                </div>
                <div className="text-[#FFFFFF] rounded-lg border border-[#DBFF00] border-b-[6px] font-superLagendBoy backdrop-blur-3xl p-6 py-6 pr-10 flex flex-col">
                  <h1 className="text-[10px]">
                    TOTAL VALUE LOCKED
                  </h1>
                  <div className="flex flex-col justify-between mt-4">
                    <h1 className="flex gap-2 items-center">
                      <span className="text-xl">{formatUnits(loans.loans.filter((loan) => loan.accepted).reduce((total, loan) => total + loan.amount, 0), 18)}</span>
                      <span className="text-3xl">LYX</span>
                    </h1>
                    <span className="text-[10px]">{loans.loans.filter((loan) => loan.accepted).length} accepted loans</span>
                  </div>
                </div>
              </div>

            </div>
            <div className="table-sec pt-24">
              <div className="sf flex justify-start items-center max-sm:flex max-sm:flex-col max-sm:gap-2 max-sm:items-start">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search here"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className="font-superLagendBoy bg-transparent placeholder-white text-white border border-[#DBFF00] rounded-lg py-1 pl-10"
                  />
                  <FiSearch
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white"
                    size={20}
                  />
                </div>
                {/* <div className="filters">
              <button className="flex font-superLagendBoy text-white  gap-2 justify-center border border-[#DBFF00] rounded-lg p-1 px-2">
                <img src={Filter} alt="filter-option" />
                <h1 className="text-sm">Filter</h1>
              </button>
            </div> */}
              </div>
              <div className="px-6  overflow-x-auto backdrop-blur-xl text-left font-superLagendBoy text-[#FFFFFF] my-12 rounded-xl border-none">
                <table className="w-full">
                  <thead>
                    <tr className="max-sm:text-[11px] text-[12px]">
                      <th className="px-4 py-2">IMAGE</th>
                      <th className="px-4 py-2">NAME</th>
                      <th className="px-4 py-2">ACTIVE LOANS</th>
                      {/* <th className="px-4 py-2">LOANS in 24H</th> */}
                      <th className="px-4 py-2">OFFERS</th>
                      <th className="px-4 py-2">FLOOR</th>
                      <th className="px-4 py-2">LTV</th>
                      <th className="px-4 py-2">FORECLOSURES</th>
                      <th className="px-4 py-2">APY</th>
                      <th className="px-4 py-2">DURATION</th>
                      <th></th>
                    </tr>
                  </thead>

                  <tbody>
                    {isLoadingCollection &&
                      <div className="flex gap-[20px] justify-center items-center text-white">
                        <FontAwesomeIcon icon={faSpinner} size="md" className="animate-spin" />
                        <span>Loading</span>
                      </div>
                    }
                    {!isLoadingCollection && collections.map((item, index) => {
                      return (
                        item.name.toLowerCase().includes(searchValue.toLowerCase()) && <tr className=" py-10 border-b-[1px] border-[#a9a9a9d8]  ">
                          <td className="p-4 px-4 flex gap-2 items-center">
                            <span>
                              <img className="w-[40px] h-[40px] object-contain rounded-full" src={item.avatar} alt="" />
                            </span>

                          </td>
                          <td className="px-4 text-[12px] max-sm:text-[11px]">
                            {item.name}
                            {/* <br />
                          <span className="text-[9px] text-[#B5B5B5]">
                            {item.collectionPer}
                          </span> */}
                          </td>
                          <td className="px-4 text-[12px] max-sm:text-[11px]">
                            {loans.loans.filter((loan) => loan.nftAddress.toLowerCase() == item.address.toLowerCase() && loan.accepted).length} loans<br />
                            <span className="text-[9px] text-[#B5B5B5]">
                              Ŀ {formatUnits(loans.loans.filter((loan) => loan.nftAddress.toLowerCase() == item.address.toLowerCase() && loan.accepted).reduce((total, loan) => total + loan.amount, 0), 18)}
                            </span>{" "}
                          </td>
                          {/* <td className="px-4 text-[12px] max-sm:text-[11px]">
                          {item.loanIn24}
                          <br />
                          <span className="text-[9px] text-[#B5B5B5]">
                            {item.loanIn24Paid}
                          </span>
                        </td> */}
                          <td className="px-4 text-[12px] max-sm:text-[11px]">
                            {loans.loans.filter((loan, index) => (
                              loan.nftAddress.toLowerCase() == item.address.toLowerCase() && loan.amount != 0 && !loan.accepted && !loan.paid && !loan.liquidated)).length} offer(s)
                          </td>
                          <td className="px-4 text-[12px] max-sm:text-[11px]">
                            <span className="text-lg mr-1">Ŀ</span>
                            {loans.loans.filter((loan) => loan.nftAddress.toLowerCase() == item.address.toLowerCase() && loan.amount != 0 && !loan.accepted && !loan.paid && !loan.liquidated).length == 0 ? 0 : formatUnits(loans.loans.filter((loan) => loan.nftAddress.toLowerCase() == item.address.toLowerCase() && loan.amount != 0 && !loan.accepted && !loan.paid && !loan.liquidated).sort((a, b) => a.amount - b.amount).at(0).amount, 18)}
                          </td>
                          <td className="px-4 text-[12px] max-sm:text-[11px]">
                            <span className="text-lg mr-1">Ŀ</span>
                            {formatUnits(loans.loans.filter((loan) => loan.nftAddress.toLowerCase() == item.address.toLowerCase() && loan.accepted && !loan.paid && !loan.liquidated).reduce((total, loan) => total + loan.amount, 0), 18)}
                          </td>
                          {/* <td className="px-4 text-[12px] max-sm:text-[11px]">
                          <span className="text-lg mr-1">Ŀ</span>
                          {formatUnits(loans.loans.filter((loan) => loan.nftAddress == item.address).reduce((total, loan) => total + loan.amount, 0), 18)}
                          <br />
                          <span className="text-[9px] text-[#B5B5B5]">
                            {item.liqPrice}
                          </span>
                        </td> */}
                          <td className="px-4 text-[12px] max-sm:text-[11px]">
                            {loans.loans.filter((loan) => loan.nftAddress.toLowerCase() == item.address.toLowerCase() && loan.liquidated).length} liquidated loans
                            <br />
                            {/* <span className="text-[9px] text-[#B5B5B5]">
                            {item.forResult}
                          </span> */}
                          </td>
                          <td className="text-[12px] max-sm:text-[11px]">{item.interest / 10} %</td>
                          <td className="text-[12px] max-sm:text-[11px]">{item.duration}</td>
                          <td><button disabled={!account.address} onClick={(e) => { onPlaceOffer(index) }} className="bg-gradient-to-r from-[#159F2C] text-black px-4 py-2 text-[12px] max-sm:text-[11px] rounded-lg to-[#DBFF00]">LEND</button></td>
                          <br />
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      {selectedLend != -1 &&
        <div className={`font-superLagendBoy fixed top-0 left-0 w-[100vw] h-[100vh] flex justify-center items-center bg-[#00000030] backdrop-blur-md p-[20px] z-10`}>
          <div
            className="fixed inset-0 transition-opacity"
            onClick={() => { if (!placeOfferPending) setSelectedLend(-1) }}
          />
          <div className="min-w-[300px] bg-[#D9D9D930] backdrop-blur-sm flex gap-[20px] flex-col rounded-[10px] p-[10px]" >
            <img className="w-full h-[125px] object-center" src={collections[selectedLend].banner} alt="banner" />
            <div className="w-full flex flex-col gap-[10px] items-center">
              <img className="w-[65px] h-[65px] object-contain rounded-full -mt-[53px]" src={collections[selectedLend].avatar} alt="avatar" />
              <span className="text-[14px] font-[400] text-white">{collections[selectedLend].name}</span>
            </div>
            <div className="w-full flex gap-[20px] justify-between">
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-[400] text-white">APY</span>
                <span className="text-[14px] font-[400] text-[#DBFF00]">{collections[selectedLend].interest / 10}%</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-[400] text-white">DURATION</span>
                <span className="text-[14px] font-[400] text-white">{(collections[selectedLend].duration / 86400).toFixed(2)}d</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-[400] text-white">FLOOR</span>
                <span className="text-[14px] font-[400] text-white">Ŀ {loans.loans.filter((loan) => loan.nftAddress.toLowerCase() == collections[selectedLend].address.toLowerCase() && loan.amount != 0 && !loan.accepted && !loan.paid && !loan.liquidated).length == 0 ? 0 : formatUnits(loans.loans.filter((loan) => loan.nftAddress.toLowerCase() == collections[selectedLend].address.toLowerCase() && loan.amount != 0 && !loan.accepted && !loan.paid && !loan.liquidated).sort((a, b) => a.amount - b.amount).at(0).amount, 18)}</span>
              </div>
            </div>
            <div className="w-full flex gap-[10px] justify-between">
              <div className="flex flex-col">
                <span className="text-[14px] font-bold text-white">Offer Amount</span>
                <input value={offerAmount} onChange={(e) => { setOfferAmount(e.target.value); setTotalInvest((Number(e.target.value) * numberOffers).toString()) }} placeholder="0" className="w-[120px] text-[14px] text-white bg-[#D9D9D930] border border-[#DBFF0030] rounded-[10px] focus:outline-none px-[20px] py-[5px]" />
              </div>
              <div className="flex flex-col">
                <span className="text-[14px] font-bold text-white">Total Invest</span>
                <input disabled={true} value={totalInvest} placeholder="0" className="w-[120px] text-[14px] text-white bg-[#D9D9D930] border border-[#DBFF0030] rounded-[10px] focus:outline-none px-[20px] py-[5px]" />
              </div>
            </div>
            <div className="w-full flex flex-col">
              <span className="text-[14px] font-bold text-white">Number of offers</span>
              <div className="flex gap-[10px] justify-between">
                <button onClick={(e) => { setNumberOffers(1); setTotalInvest((Number(offerAmount)).toString()); }} className={`text-[14px] ${numberOffers == 1 ? "text-[#DBFF00]" : "text-white"} bg-[#D9D9D930] border ${numberOffers == 1 ? "border-[#DBFF00]" : "border-[#DBFF0030]"} rounded-[10px] focus:outline-none px-[20px] py-[5px]`}>1</button>
                <button onClick={(e) => { setNumberOffers(2); setTotalInvest((Number(offerAmount) * 2).toString()); }} className={`text-[14px] ${numberOffers == 2 ? "text-[#DBFF00]" : "text-white"} bg-[#D9D9D930] border ${numberOffers == 2 ? "border-[#DBFF00]" : "border-[#DBFF0030]"} rounded-[10px] focus:outline-none px-[20px] py-[5px]`}>2</button>
                <button onClick={(e) => { setNumberOffers(4); setTotalInvest((Number(offerAmount) * 4).toString()); }} className={`text-[14px] ${numberOffers == 4 ? "text-[#DBFF00]" : "text-white"} bg-[#D9D9D930] border ${numberOffers == 4 ? "border-[#DBFF00]" : "border-[#DBFF0030]"} rounded-[10px] focus:outline-none px-[20px] py-[5px]`}>4</button>
              </div>
            </div>
            <div className="w-full flex justify-center">
              <button disabled={placeOfferPending} onClick={(e) => { placeOffer() }} className="bg-gradient-to-r from-[#159F2C] text-black px-6 py-2 max-sm:text-[11px] max-sm:px-4 rounded-lg to-[#DBFF00]">
                PLACE OFFER {placeOfferPending ? <FontAwesomeIcon icon={faSpinner} size="sm" className="animate-spin" /> : <></>}</button>
            </div>
          </div>
        </div>
      }
    </>
  )
}

export default OrderBook