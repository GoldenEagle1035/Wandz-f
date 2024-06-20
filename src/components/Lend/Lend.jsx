import React, { useEffect, useState, useContext } from "react";
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
import { wagmiConfig } from "../../services/web3/wagmiConfig";

// import { collections } from "../../data/collections";

import Slider from '@mui/material/Slider';

function Lend() {

  const [showAddDlg, setShowAddDlg] = useState(false);
  const [addCollectionAddress, setAddCollectionAddress] = useState('');
  const [addDuration, setAddDuration] = useState('');
  const [addAPY, setAddAPY] = useState('');
  const [addFee, setAddFee] = useState('');
  const [addLoanPending, setAddLoanPending] = useState(false);

  const [selectedLend, setSelectedLend] = useState(-1);
  const [offerAmount, setOfferAmount] = useState('');
  const [totalInvest, setTotalInvest] = useState('');
  const [numberOffers, setNumberOffers] = useState(1);
  const [placeOfferPending, setPlaceOfferPending] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const [searchValue, setSearchValue] = useState('');
  const [showMore, setShowMore] = useState(false);

  const account = useAccount();

  const loans = useContext(LoansContext);
  const { collections, isLoading: isLoadingCollection } = useContext(CollectionsContext);

  const onAddLend = () => {
    setAddCollectionAddress('');
    setAddDuration('');
    setAddAPY('');
    setAddFee('');
    setShowAddDlg(true);
  }

  const addLend = async () => {
    if (account.address) {
      setAddLoanPending(true);
      try {
        const result = await loans.proposeLoan({
          args: [
            addCollectionAddress,
            Number(addDuration),
            Number(addAPY),
            Number(addFee)
          ],
          from: account.address
        })
        console.log("proposeLoan:", result);
      } catch (error) {
        console.log(error);
      }
      setAddLoanPending(false);
      setShowAddDlg(false);
    }
  }

  const onPlaceOffer = (lendIndex) => {
    console.log("lendIndex", lendIndex);
    setOfferAmount('');
    setTotalInvest('');
    setNumberOffers(1);
    setSelectedLend(lendIndex);
    setConfirmed(false);
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
        await loans.waitForTransactionReceipt(wagmiConfig, { hash: result });
        console.log("offerLoan:", result);
        setConfirmed(true);
      } catch (error) {
        console.log(error);
        setSelectedLend(-1);
      }
      setPlaceOfferPending(false);
    }
  }

  const valuetext = (value) => {
    setNumberOffers(value);
    setTotalInvest((Number(offerAmount) * Number(value.toFixed(0))).toString());
    return `${value}`;
  }

  return (
    <>
      <div className="lend-section">
        <div className="main-page">
          <Nav btnText={"Select Profile"} />
          <div className="container relative">
            <div className="text-section font-superLagendBoy text-center pt-36 pb-20">
              <h1 className="text-[2.5rem] text-gradient-bg leading-loose sm:text-[2rem] max-sm:text-[1.5rem] sm:p-4 ">
                Make loan offers on NFT collections.
              </h1>
              <p className="max-sm:hidden font-superLagendBoy text-xl max-sm:text-lg text-[#FFFFFF]">
                Browse collections below, and name your price. To take your offer, they lock in
                an NFT from that collection to use as collateral. You will be
                repaid at the end of the loan, plus interest. If they fail to
                repay, you get to keep the NFT.
              </p>
              <div className="hidden max-sm:flex flex-col gap-[10px] items-center">
                {showMore ? <p className="font-superLagendBoy text-xl max-sm:text-lg text-[#FFFFFF]">
                  Browse collections below, and name your price. To take your offer, they lock in
                  an NFT from that collection to use as collateral. You will be
                  repaid at the end of the loan, plus interest. If they fail to
                  repay, you get to keep the NFT.
                </p> : <>
                  <p className="font-superLagendBoy text-xl max-sm:text-lg text-[#FFFFFF]">
                    Browse collections below, and name your price.
                  </p>
                  <button onClick={(e) => setShowMore(true)} className="font-superLagendBoy text-xl max-sm:text-lg text-[#DBFF00] underline">Show More</button>
                </>}
              </div>
            </div>
            <div className="table-sec">
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
                {/* <div className="filters flex gap-[20px] items-center">
                  <button className="flex font-superLagendBoy text-white  gap-2 justify-center border border-[#DBFF00] rounded-lg p-1 px-2">
                    <img src={Filter} alt="filter-option" />
                    <h1 className="text-sm">Filter</h1>
                  </button>
                </div> */}
              </div>
              {isLoadingCollection &&
                <div className="flex gap-[20px] justify-center items-center text-white">
                  <FontAwesomeIcon icon={faSpinner} size="md" className="animate-spin" />
                  <span>Loading</span>
                </div>
              }
              {!isLoadingCollection && <div className="max-sm:hidden px-6 overflow-x-auto bg-[#45291D50] backdrop-blur-xl text-left font-superLagendBoy text-[#FFFFFF] my-12 rounded-xl border-none">
                <table className="w-full p-10">
                  <thead>
                    <tr className="max-sm:text-[11px]">
                      <th className="p-6">Collection</th>
                      <th className="pl-4 max-sm:px-4">Available Pool</th>
                      <th className="pl-4 max-sm:px-4">Best offer</th>
                      <th className="pl-4 max-sm:px-4">APY</th>
                      <th className="pl-4 max-sm:px-4">Duration</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {collections.map((collection, index) => {
                      return (
                        collection.name.toLowerCase().includes(searchValue.toLowerCase()) && <tr className=" py-10 border-b-[1px] max-sm:px-4 border-[#a9a9a9d8]">
                          <td className="p-4 pl-4 max-sm:px-4 flex gap-2 items-center max-sm:text-[11px]">
                            <span className="max-sm:w-6">
                              <img className="w-[40px] h-[40px] object-contain rounded-full" src={collection.avatar} alt="" />
                            </span>
                            {collection.name}
                          </td>
                          <td className=" pl-4 max-sm:text-[11px] max-sm:px-4">
                            <span className="text-lg mr-1 text-nowrap">θ {formatUnits(loans.loans.filter((loan) => loan.nftAddress.toLowerCase() == collection.address.toLowerCase() && loan.duration == collection.duration && loan.amount != 0 && !loan.accepted && !loan.paid && !loan.liquidated).reduce((total, loan) => total + loan.amount, 0), 18)}</span>
                            <br />
                            <span className="text-[9px]  max-sm:text-[8px] text-[#B5B5B5] text-nowrap">
                              {loans.loans.filter((loan) => loan.nftAddress.toLowerCase() == collection.address.toLowerCase() && loan.duration == collection.duration && loan.accepted).length} of {loans.loans.filter((loan) => loan.nftAddress.toLowerCase() == collection.address.toLowerCase() && loan.duration == collection.duration).length} offer(s)
                            </span>
                          </td>
                          <td className="max-sm:text-[11px] pl-4 max-sm:px-4">
                            <span className="text-lg mr-1 text-nowrap">θ {loans.loans.filter((loan) => loan.nftAddress.toLowerCase() == collection.address.toLowerCase() && loan.duration == collection.duration && loan.amount != 0 && !loan.accepted && !loan.paid && !loan.liquidated).length == 0 ? 0 : formatUnits(loans.loans.filter((loan) => loan.nftAddress.toLowerCase() == collection.address.toLowerCase() && loan.duration == collection.duration && loan.amount != 0 && !loan.accepted && !loan.paid && !loan.liquidated).sort((a, b) => a.amount - b.amount).at(0).amount, 18)}</span> <br />
                            <span className="text-[9px] max-sm:text-[8px] text-[#B5B5B5]">
                              θ {loans.loans.filter((loan) => loan.nftAddress.toLowerCase() == collection.address.toLowerCase() && loan.duration == collection.duration && loan.amount != 0 && !loan.accepted && !loan.paid && !loan.liquidated).length == 0 ? 0 : formatUnits(loans.loans.filter((loan) => loan.nftAddress.toLowerCase() == collection.address.toLowerCase() && loan.duration == collection.duration && loan.amount != 0 && !loan.accepted && !loan.paid && !loan.liquidated).at(loans.loans.filter((loan) => loan.nftAddress.toLowerCase() == collection.address.toLowerCase() && loan.duration == collection.duration && loan.amount != 0 && !loan.accepted && !loan.paid && !loan.liquidated).length - 1).amount, 18)} last loan
                            </span>{" "}
                          </td>
                          <td className="max-sm:text-[11px] pl-4 max-sm:px-4">{collection.interest / 10 - 100}%</td>
                          <td className="ml-6 max-sm:text-[11px] pl-4 max-sm:px-4">{(collection.duration / 86400).toFixed(2)}d</td>
                          <td><button disabled={!account.address} onClick={(e) => { onPlaceOffer(index) }} className="bg-gradient-to-r from-[#159F2C] text-black px-6 py-2 max-sm:text-[11px] max-sm:px-4 rounded-lg to-[#DBFF00]">LEND</button></td>
                          <br />
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              }
              {!isLoadingCollection && <div className="hidden max-sm:flex px-3 bg-[#45291D50] backdrop-blur-xl font-superLagendBoy my-12 rounded-xl border-none flex-col gap-[10px] p-10">
                <div className="flex gap-[5px] items-center text-white text-[11px]">
                  <span className="w-1/4 text-center">Available Pool</span>
                  <span className="w-1/4 text-center">Best Offer</span>
                  <span className="w-1/4 text-center">APY</span>
                  <span className="w-1/4 text-center">Duration</span>
                </div>
                <div className="flex flex-col">
                  {collections.map((collection, index) => (
                    collection.name.toLowerCase().includes(searchValue.toLowerCase()) &&
                    <div className="py-4 border-b-[1px] border-[#a9a9a9d8] flex flex-col gap-[5px]">
                      <div className="flex gap-[10px] justify-between items-center">
                        <div className="flex gap-[5px] items-center">
                          <img className="w-[40px] h-[40px] object-contain rounded-full" src={collection.avatar} alt="" />
                          <span className="text-[11px] text-white">{collection.name}</span>
                        </div>
                        <button disabled={!account.address} onClick={(e) => onPlaceOffer(index)} className="bg-gradient-to-r from-[#159F2C] text-black px-4 py-2 rounded-lg to-[#DBFF00] text-[10px]">LEND</button>
                      </div>
                      <div className="flex gap-[5px] text-white text-[11px]">
                        <span className="w-1/4 text-center">θ {formatUnits(loans.loans.filter((loan) => loan.nftAddress.toLowerCase() == collection.address.toLowerCase() && loan.duration == collection.duration && loan.amount != 0 && !loan.accepted && !loan.paid && !loan.liquidated).reduce((total, loan) => total + loan.amount, 0), 18)}</span>
                        <span className="w-1/4 text-center">θ {loans.loans.filter((loan) => loan.nftAddress.toLowerCase() == collection.address.toLowerCase() && loan.duration == collection.duration && loan.amount != 0 && !loan.accepted && !loan.paid && !loan.liquidated).length == 0 ? 0 : formatUnits(loans.loans.filter((loan) => loan.nftAddress.toLowerCase() == collection.address.toLowerCase() && loan.duration == collection.duration && loan.amount != 0 && !loan.accepted && !loan.paid && !loan.liquidated).sort((a, b) => a.amount - b.amount).at(0).amount, 18)}</span>
                        <span className="w-1/4 text-center">{collection.interest / 10 - 100} %</span>
                        <span className="w-1/4 text-center">{(collection.duration / 86400).toFixed(2)}d</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              }
            </div>
          </div>
        </div>
      </div >
      {showAddDlg &&
        <div className={`font-superLagendBoy fixed top-0 left-0 w-[100vw] h-[100vh] flex justify-center items-center bg-[#00000030] backdrop-blur-md p-[20px] z-10`}>
          <div
            className="fixed inset-0 transition-opacity"
            onClick={() => { if (!addLoanPending) setShowAddDlg(false) }}
          />
          <div className="min-w-[300px] bg-[#D9D9D930] backdrop-blur-sm flex gap-[20px] flex-col rounded-[10px] py-[30px] px-[20px]" >
            <span className="w-full text-[30px] font-bold text-white text-center">ADD LOAN</span>
            <div className="flex flex-col gap-[10px]">
              <div className="flex flex-col">
                <span className="text-[20px] font-bold text-white">Collection Address</span>
                <input value={addCollectionAddress} onChange={(e) => setAddCollectionAddress(e.target.value)} placeholder="0x..." className="text-[20px] text-white bg-[#D9D9D930] border border-[#DBFF00] rounded-[10px] focus:outline-none px-[20px] py-[5px]" />
              </div>
              <div className="flex flex-col">
                <span className="text-[20px] font-bold text-white">Duration</span>
                <input value={addDuration} onChange={(e) => setAddDuration(e.target.value)} placeholder="0" className="text-[20px] text-white bg-[#D9D9D930] border border-[#DBFF00] rounded-[10px] focus:outline-none px-[20px] py-[5px]" />
              </div>
              <div className="flex flex-col">
                <span className="text-[20px] font-bold text-white">APY</span>
                <input value={addAPY} onChange={(e) => setAddAPY(e.target.value)} placeholder="%" className="text-[20px] text-white bg-[#D9D9D930] border border-[#DBFF00] rounded-[10px] focus:outline-none px-[20px] py-[5px]" />
              </div>
              <div className="flex flex-col">
                <span className="text-[20px] font-bold text-white">Fee</span>
                <input value={addFee} onChange={(e) => setAddFee(e.target.value)} placeholder="%" className="text-[20px] text-white bg-[#D9D9D930] border border-[#DBFF00] rounded-[10px] focus:outline-none px-[20px] py-[5px]" />
              </div>
              <button disabled={addLoanPending} onClick={(e) => { addLend() }} className="bg-gradient-to-r from-[#159F2C] text-black px-6 py-2 max-sm:text-[11px] max-sm:px-4 rounded-lg to-[#DBFF00]">
                ADD {addLoanPending ? <FontAwesomeIcon icon={faSpinner} size="sm" className="animate-spin" /> : <></>}</button>
            </div>
          </div>
        </div>
      }
      {
        selectedLend != -1 && !confirmed &&
        <div className={`font-superLagendBoy fixed top-0 left-0 w-[100vw] h-[100vh] flex justify-center items-center bg-[#00000030] backdrop-blur-md p-[20px] z-10`}>
          <div
            className="fixed inset-0 transition-opacity"
            onClick={() => { if (!placeOfferPending) setSelectedLend(-1) }}
          />
          <div className="min-w-[300px] max-w-[400px] bg-[#D9D9D930] backdrop-blur-sm flex gap-[20px] flex-col rounded-[10px] p-[10px]" >
            <img className="w-full h-[125px] object-center" src={collections[selectedLend].banner} alt="banner" />
            <div className="w-full flex flex-col gap-[10px] items-center">
              <img className="w-[65px] h-[65px] object-contain rounded-full -mt-[53px]" src={collections[selectedLend].avatar} alt="avatar" />
              <span className="text-[14px] font-[400] text-white">{collections[selectedLend].name}</span>
            </div>
            <div className="w-full flex gap-[20px] justify-between">
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-[400] text-white">APY</span>
                <span className="text-[14px] font-[400] text-[#DBFF00]">{collections[selectedLend].interest / 10 - 100}%</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-[400] text-white">DURATION</span>
                <span className="text-[14px] font-[400] text-white">{(collections[selectedLend].duration / 86400).toFixed(2)}d</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-[400] text-white">FLOOR</span>
                <span className="text-[14px] font-[400] text-white">θ {loans.loans.filter((loan) => loan.nftAddress.toLowerCase() == collections[selectedLend].address.toLowerCase() && loan.amount != 0 && !loan.accepted && !loan.paid && !loan.liquidated).length == 0 ? 0 : formatUnits(loans.loans.filter((loan) => loan.nftAddress.toLowerCase() == collections[selectedLend].address.toLowerCase() && loan.amount != 0 && !loan.accepted && !loan.paid && !loan.liquidated).sort((a, b) => a.amount - b.amount).at(0).amount, 18)}</span>
              </div>
            </div>
            <div className="w-full flex gap-[10px] justify-between">
              <div className="flex flex-col">
                <span className="text-[14px] font-bold text-white">Offer Amount</span>
                <div className="flex gap-[10px] items-center">
                  <input type="number" value={offerAmount} onChange={(e) => { setOfferAmount(e.target.value); setTotalInvest((Number(e.target.value) * numberOffers).toString()) }} placeholder="0" className="w-[120px] text-[14px] text-white bg-[#D9D9D930] border border-[#DBFF0030] rounded-[10px] focus:outline-none px-[20px] py-[5px]" />
                  <span className="text-[14px] font-bold text-white">LYX</span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-[14px] font-bold text-white">Total Invest</span>
                <input disabled={true} value={totalInvest} placeholder="0" className="w-[120px] text-[14px] text-white bg-[#D9D9D930] border border-[#DBFF0030] rounded-[10px] focus:outline-none px-[20px] py-[5px]" />
              </div>
            </div>
            <div className="w-full flex flex-col">
              <span className="text-[14px] font-bold text-white">Number of offers</span>
              <div className="flex gap-[10px] justify-between pt-[50px] px-[20px]">
                {/* <button onClick={(e) => { setNumberOffers(1); setTotalInvest((Number(offerAmount)).toString()); }} className={`text-[14px] ${numberOffers == 1 ? "text-[#DBFF00]" : "text-white"} bg-[#D9D9D930] border ${numberOffers == 1 ? "border-[#DBFF00]" : "border-[#DBFF0030]"} rounded-[10px] focus:outline-none px-[20px] py-[5px]`}>1</button>
                <button onClick={(e) => { setNumberOffers(2); setTotalInvest((Number(offerAmount) * 2).toString()); }} className={`text-[14px] ${numberOffers == 2 ? "text-[#DBFF00]" : "text-white"} bg-[#D9D9D930] border ${numberOffers == 2 ? "border-[#DBFF00]" : "border-[#DBFF0030]"} rounded-[10px] focus:outline-none px-[20px] py-[5px]`}>2</button>
                <button onClick={(e) => { setNumberOffers(4); setTotalInvest((Number(offerAmount) * 4).toString()); }} className={`text-[14px] ${numberOffers == 4 ? "text-[#DBFF00]" : "text-white"} bg-[#D9D9D930] border ${numberOffers == 4 ? "border-[#DBFF00]" : "border-[#DBFF0030]"} rounded-[10px] focus:outline-none px-[20px] py-[5px]`}>4</button> */}
                <Slider
                  aria-label="Always visible"
                  defaultValue={1}
                  getAriaValueText={valuetext}
                  step={1}
                  min={1}
                  max={10}
                  valueLabelDisplay="on"
                />
              </div>
            </div>
            <div className="w-full flex justify-center">
              <button disabled={placeOfferPending} onClick={(e) => { placeOffer() }} className="bg-gradient-to-r from-[#159F2C] text-black px-6 py-2 max-sm:text-[11px] max-sm:px-4 rounded-lg to-[#DBFF00]">
                PLACE OFFER {placeOfferPending ? <FontAwesomeIcon icon={faSpinner} size="sm" className="animate-spin" /> : <></>}</button>
            </div>
          </div>
        </div>
      }
      {
        selectedLend != -1 && confirmed &&
        <div className={`font-superLagendBoy fixed top-0 left-0 w-[100vw] h-[100vh] flex justify-center items-center bg-[#00000030] backdrop-blur-md p-[20px] z-10`}>
          <div
            className="fixed inset-0 transition-opacity"
            onClick={() => { setSelectedLend(-1) }}
          />
          <div className="min-w-[300px] max-w-[400px] bg-[#D9D9D930] backdrop-blur-sm flex gap-[20px] flex-col rounded-[10px] p-[10px]" >
            <img className="w-full h-[125px] object-center" src={collections[selectedLend].banner} alt="banner" />
            <div className="w-full flex flex-col gap-[10px] items-center">
              <div className="w-[65px] h-[65px] flex justify-center items-center rounded-full border-[0.25px] border-[#DBFF00] -mt-[53px] bg-[#000]">
                <svg width="37" height="28" viewBox="0 0 37 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 17.25L10.5212 27L36 1" stroke="#DBFF00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </div>
            </div>
            <span className="text-[14px] font-[400] text-white text-center">You have Successfully Offered</span>
            <div className="flex gap-[10px] justify-center items-center">
              <span className="text-[14px] font-[400] text-white">{numberOffers} loan(s) for</span>
              <span className="text-[14px] font-[400] text-[#DBFF00]">θ {Number(offerAmount) * Number(numberOffers)}</span>
            </div>
            <div className="w-full flex gap-[20px] justify-between">
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-[400] text-white">APY</span>
                <span className="text-[14px] font-[400] text-[#DBFF00]">{collections[selectedLend].interest / 10 - 100}%</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-[400] text-white">DURATION</span>
                <span className="text-[14px] font-[400] text-white">{(collections[selectedLend].duration / 86400).toFixed(2)}d</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-[400] text-white">FLOOR</span>
                <span className="text-[14px] font-[400] text-white">θ {loans.loans.filter((loan) => loan.nftAddress.toLowerCase() == collections[selectedLend].address.toLowerCase() && loan.amount != 0 && !loan.accepted && !loan.paid && !loan.liquidated).length == 0 ? 0 : formatUnits(loans.loans.filter((loan) => loan.nftAddress.toLowerCase() == collections[selectedLend].address.toLowerCase() && loan.amount != 0 && !loan.accepted && !loan.paid && !loan.liquidated).sort((a, b) => a.amount - b.amount).at(0).amount, 18)}</span>
              </div>
            </div>
            <div className="w-full flex justify-center">
              <button onClick={(e) => { setSelectedLend(-1) }} className="bg-gradient-to-r from-[#159F2C] text-black px-6 py-2 max-sm:text-[11px] max-sm:px-4 rounded-lg to-[#DBFF00]">OK</button>
            </div>
          </div>
        </div>
      }
    </>
  );
}

export default Lend;
