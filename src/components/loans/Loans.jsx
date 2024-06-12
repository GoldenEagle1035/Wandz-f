import React, { useEffect, useState, useRef, useContext } from "react";
import Nav from "../global/Nav";
import VideoBG from "../global/VideoBG";
import { MdArrowDownward } from "react-icons/md";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLessThanEqual, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { CSVLink } from "react-csv";
import LendDlgBanner from "../../assets/background/lendDlgBanner.png";

import { useAccount } from 'wagmi';
import { parseEther, formatUnits } from 'viem';
import { useAccountBalance } from "../../hooks/wandz-eth";

import { LoansContext } from "../../context/loan-context";
import { CollectionsContext } from "../../context/collection-context";
import { wagmiConfig } from "../../services/web3/wagmiConfig";
// import { collections } from "../../data/collections";

function Loans() {

  const [selectedLend, setSelectedLend] = useState(-1);
  const [isRepay, setIsRepay] = useState(false);
  const [isLiquidate, setIsLiquidate] = useState(false);
  const [repayPending, setRepayPending] = useState(false);
  const [liquidatePending, setLiquidatePending] = useState(false);
  const [extendPending, setExtendPending] = useState(false);
  const [extendDays, setExtendDays] = useState('');
  const [downloadData, setDownloadData] = useState([]);
  const [confirmed, setConfirmed] = useState(false);

  const [showMore, setShowMore] = useState(false);

  const csvRef = useRef(null);

  const account = useAccount();

  const loans = useContext(LoansContext);
  const { collections, isLoading: isLoadingCollection } = useContext(CollectionsContext);

  const { balance, isError, isLoading } = useAccountBalance(account.address);

  const onExtendOffer = (lendIndex) => {
    setExtendDays('');
    setIsRepay(false);
    setIsLiquidate(false);
    setSelectedLend(lendIndex);
    setConfirmed(false);
  }

  const extendOffer = async () => {
    if (account.address) {
      setExtendPending(true);
      try {
        const result = await loans.extendLoan({
          args: [loans.loans[selectedLend].loanId, 86400 * Number(extendDays)],
          value: parseEther(formatUnits(loans.loans[selectedLend].amount * loans.loans[selectedLend].interest / 1000 * (86400 * Number(extendDays) / loans.loans[selectedLend].duration), 18)),
          from: account.address
        })
        await loans.waitForTransactionReceipt(wagmiConfig, { hash: result });
        console.log("extendLoan:", result);
        setConfirmed(true);
      } catch (error) {
        console.log(error);
        setSelectedLend(-1);
      }
      setExtendPending(false);
    }
  }

  const onRepayOffer = (lendIndex) => {
    setIsRepay(true);
    setIsLiquidate(false);
    setSelectedLend(lendIndex);
    setConfirmed(false);
  }

  const onLiquidateOffer = (lendIndex) => {
    setIsRepay(false);
    setIsLiquidate(true);
    setSelectedLend(lendIndex);
    setConfirmed(false);
  }

  const repayOffer = async () => {
    if (account.address) {
      setRepayPending(true);
      try {
        const result = await loans.repayLoan({
          args: [loans.loans[selectedLend].loanId],
          value: parseEther(formatUnits(loans.loans[selectedLend].amount * loans.loans[selectedLend].interest / 1000, 18)),
          from: account.address
        })
        await loans.waitForTransactionReceipt(wagmiConfig, { hash: result });
        console.log("repayLoan:", result);
        setConfirmed(true);
      } catch (error) {
        console.log(error);
        setSelectedLend(-1);
      }
      setRepayPending(false);
    }
  }

  const liquidateOffer = async () => {
    if (account.address) {
      setLiquidatePending(true);
      try {
        const result = await loans.liquidateLoan({
          args: [loans.loans[selectedLend].loanId],
          from: account.address
        })
        await loans.waitForTransactionReceipt(wagmiConfig, { hash: result });
        console.log("liquidateLoan:", result);
      } catch (error) {
        console.log(error);
        setSelectedLend(-1);
      }
      setLiquidatePending(false);
    }
  }

  const onDownloadCSV = () => {
    csvRef.current.link.click();
  }

  useEffect(() => {
    if (!isLoadingCollection) {
      let data = [];
      loans.loans.filter((loan) => account.address && loan.borrower.toLowerCase() == account.address.toLowerCase() && loan.accepted && !loan.paid && !loan.liquidated).map((loan) => {
        data.push({
          COLLECTION: collections.find((collection) => collection.address.toLowerCase() == loan.nftAddress.toLowerCase() && collection.duration == loan.duration).name,
          BORROWED: 'Ŀ' + formatUnits(loan.amount, 18),
          TERM: Math.abs((loan.durationCounter - Date.now() / 1000) / 86400).toFixed(2) + (loan.durationCounter - Date.now() / 1000) / 86400 >= 0 ? "d Remaining" : "d Passed",
          REPAYMENT: 'Ŀ' + formatUnits(loan.amount * loan.interest / 1000, 18),
        })
      })
      setDownloadData(data);
    }
  }, [loans.loans, isLoadingCollection])

  return (
    <>
      <div className="loans-page pb-[30px]">
        {/* <VideoBG /> */}
        <Nav btnText={"Select Profile"} />
        <div className="container relative">
          <div className="text-section font-superLagendBoy text-center pt-36 pb-20">
            <h1 className="text-[2.5rem] sm:text-[2rem] max-sm:text-[1.5rem] sm:p-4 text-gradient-bg leading-loose">
              MY LOANS
            </h1>
            <p className="max-sm:hidden font-superLagendBoy text-xl max-sm:text-lg text-[#FFFFFF]">
              Here are the NFTs you borrowed against. You must pay these in full by the expiration date in order to keep your NFT.
            </p>
            <div className="hidden max-sm:flex flex-col gap-[10px] items-center">
              {showMore ? <p className="font-superLagendBoy text-xl max-sm:text-lg text-[#FFFFFF]">
                Here are the NFTs you borrowed against. You must pay these in full by the expiration date in order to keep your NFT.
              </p> : <>
                <p className="font-superLagendBoy text-xl max-sm:text-lg text-[#FFFFFF]">
                  Here are the NFTs you borrowed against.
                </p>
                <button onClick={(e) => setShowMore(true)} className="font-superLagendBoy text-xl max-sm:text-lg text-[#DBFF00] underline">Show More</button>
              </>}
            </div>
            {loans.loans.filter((loan) => account.address && loan.borrower.toLowerCase() == account.address.toLowerCase() && loan.accepted && !loan.paid && !loan.liquidated).length == 0 && <h1 className="mt-24 font-superLagendBoy text-4xl max-sm:text-lg text-[#FFFFFF]">No active or completed loans.</h1>}
          </div>
          <div className="second-sec py-16 flex flex-col gap-24">
            <div>
              <h1 className=" font-superLagendBoy flex gap-2 text-[#FFFFFF] items-center text-sm">
                Download history (CSV){" "}
                <span onClick={(e) => { onDownloadCSV() }} className="cursor-pointer">
                  <MdArrowDownward color="#DBFF00" size={20} />
                </span>
                <CSVLink
                  data={downloadData}
                  filename="loans_history.csv"
                  className="hidden"
                  ref={csvRef}
                  target="_blank"
                />
              </h1>
            </div>
            <div className="boxes max-sm:px-2">
              <div className="flex max-sm:flex-col gap-4 max-sm:gap-4">
                <div className="text-[#FFFFFF] rounded-lg border border-[#DBFF00] border-b-[6px] font-superLagendBoy backdrop-blur-3xl p-6 py-6 pr-10 flex flex-col">
                  <h1 className="text-[10px]">
                    TOTAL ACTIVE LOANS
                  </h1>
                  <div className="flex flex-col justify-between mt-4">
                    <h1 className="flex gap-1">
                      <span className="text-3xl">{loans.loans.filter((loan) => account.address && loan.borrower.toLowerCase() == account.address.toLowerCase() && loan.accepted && !loan.paid && !loan.liquidated).length} loans</span>
                      {/* <span>{item.price}</span> */}
                    </h1>
                    {/* <span className="text-[10px]">{item.statusValue} {item.status}</span> */}
                  </div>
                </div>
                <div className="text-[#FFFFFF] rounded-lg border border-[#DBFF00] border-b-[6px] font-superLagendBoy backdrop-blur-3xl p-6 py-6 pr-10 flex flex-col justify-between">
                  <h1 className="text-[10px]">
                    TOTAL BORROWED
                  </h1>
                  <div className="flex flex-col justify-between mt-6">
                    <h1 className="flex flex-col gap-1">
                      <p className="flex gap-3 items-center">
                        <span className="text-xl">{formatUnits(loans.loans.filter((loan) => account.address && loan.borrower.toLowerCase() == account.address.toLowerCase() && loan.accepted && !loan.paid && !loan.liquidated).reduce((total, loan) => total + loan.amount, 0), 18)}</span>
                        <span className="text-3xl">LYX</span>
                      </p>
                      <span className="text-sm">{!account.address || isLoading || isError || balance == null ? 0 : balance.toFixed(2)} LYX in wallet</span>
                    </h1>
                    {/* <span className="text-[10px]">{item.statusValue} {item.status}</span> */}
                  </div>
                </div>

                <div className="text-[#FFFFFF] rounded-lg border border-[#DBFF00] border-b-[6px] font-superLagendBoy backdrop-blur-3xl p-4 py-6 pr-10 flex flex-col gap-2">
                  <h1 className="text-[10px]">
                    TOTAL INTEREST OWED
                  </h1>
                  <div className="flex flex-col justify-between mt-4">
                    <p className="flex gap-3 items-center">
                      <span className="text-xl">{formatUnits(loans.loans.filter((loan) => account.address && loan.borrower.toLowerCase() == account.address.toLowerCase() && loan.accepted && !loan.paid && !loan.liquidated).reduce((total, loan) => total + loan.amount * (loan.interest / 10 - 100) / 100, 0), 18)}</span>
                      <span className="text-3xl">LYX</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {isLoadingCollection &&
            <div className="flex gap-[20px] justify-center items-center font-superLagendBoy text-white">
              <FontAwesomeIcon icon={faSpinner} size="md" className="animate-spin" />
              <span>Loading</span>
            </div>
          }
          {!isLoadingCollection && loans.loans.filter((loan) => account.address && loan.borrower.toLowerCase() == account.address.toLowerCase() && loan.accepted && !loan.paid && !loan.liquidated).length != 0 &&
            <div className="max-sm:hidden px-6 overflow-x-auto bg-[#45291D50] backdrop-blur-xl text-left font-superLagendBoy text-[#FFFFFF] my-12 rounded-xl border-none">
              <table className="w-full p-10">
                <thead>
                  <tr className="max-sm:text-[11px]">
                    <th className="p-6">Collection</th>
                    <th className="pl-4 max-sm:px-4">Offer</th>
                    <th className="pl-4 max-sm:px-4">Status</th>
                    <th className="pl-4 max-sm:px-4">Reward</th>
                    <th className="pl-4 max-sm:px-4">Duration</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {loans.loans.map((loan, index) => (
                    account.address && loan.borrower.toLowerCase() == account.address.toLowerCase() && loan.accepted && !loan.paid && !loan.liquidated && <tr className=" py-10 border-b-[1px] max-sm:px-4 border-[#a9a9a9d8]">
                      <td className="p-4 pl-4 max-sm:px-4 flex gap-2 items-center max-sm:text-[11px]">
                        <span className="max-sm:w-6">
                          <img className="w-[40px] h-[40px] object-contain rounded-full" src={collections.find((collection) => collection.address.toLowerCase() == loan.nftAddress.toLowerCase() && collection.duration == loan.duration).avatar} alt="" />
                        </span>
                        {collections.find((collection) => collection.address.toLowerCase() == loan.nftAddress.toLowerCase() && collection.duration == loan.duration).name}
                      </td>
                      <td className=" pl-4 max-sm:text-[11px] max-sm:px-4">
                        <span className="text-[12px] font-bold text-white">Ŀ</span>
                        <span className="text-[12px] font-bold text-[#DBFF00]">{formatUnits(loan.amount, 18)}</span>
                      </td>
                      <td className="max-sm:text-[11px] pl-4 max-sm:px-4">
                        <span className="text-[12px] font-bold text-white">{Math.abs((loan.durationCounter - Date.now() / 1000) / 86400).toFixed(2)} {(loan.durationCounter - Date.now() / 1000) / 86400 >= 0 ? "d Remaining" : "d Passed"}</span>
                      </td>
                      <td className="max-sm:text-[11px] pl-4 max-sm:px-4">
                        <span className="text-[12px] font-bold text-white">Ŀ</span>
                        <span className="text-[12px] font-bold text-[#DBFF00]">{formatUnits(loan.amount * loan.interest / 1000, 18)}</span>
                      </td>
                      <td className="pl-4 max-sm:px-4 max-sm:text-[11px]">{(loan.duration / 86400).toFixed(2)}d</td>
                      <td>
                        <button onClick={(e) => { onRepayOffer(index) }} className="bg-gradient-to-r from-[#159F2C] text-black px-6 py-2 max-sm:text-[11px] max-sm:px-4 rounded-lg to-[#DBFF00]">REPAY</button>
                      </td>
                      {(loan.durationCounter - Date.now() / 1000) / 86400 < 0 && <td>
                        <button onClick={(e) => { onLiquidateOffer(index) }} className="bg-gradient-to-r from-[#159F2C] text-black px-6 py-2 max-sm:text-[11px] max-sm:px-4 rounded-lg to-[#DBFF00]">LIQUIDATE</button>
                      </td>}
                      <td>
                        <button disabled={loan.extends > 2} onClick={(e) => { onExtendOffer(index) }} className={`bg-gradient-to-r from-[#159F2C] text-black px-6 py-2 max-sm:text-[11px] max-sm:px-4 rounded-lg to-[#DBFF00] disabled:opacity-50`}>EXTEND</button>
                      </td>
                    </tr>
                  )
                  )}
                </tbody>
              </table>
            </div>
          }
          {!isLoadingCollection && <div className="hidden max-sm:flex px-3 bg-[#45291D50] backdrop-blur-xl font-superLagendBoy my-12 rounded-xl border-none flex-col gap-[10px] p-10">
            <div className="flex gap-[5px] items-center text-white text-[11px]">
              <span className="w-1/4 text-center">Offer</span>
              <span className="w-1/4 text-center">Status</span>
              <span className="w-1/4 text-center">Reward</span>
              <span className="w-1/4 text-center">Duration</span>
            </div>
            <div className="flex flex-col">
              {loans.loans.map((loan, index) => (
                account.address && loan.borrower.toLowerCase() == account.address.toLowerCase() && loan.accepted && !loan.paid && !loan.liquidated &&
                <div className="py-4 border-b-[1px] border-[#a9a9a9d8] flex flex-col gap-[5px]">
                  <div className="flex gap-[10px] justify-between items-center">
                    <div className="flex gap-[5px] items-center">
                      <img className="w-[40px] h-[40px] object-contain rounded-full" src={collections.find((collection) => collection.address.toLowerCase() == loan.nftAddress.toLowerCase() && collection.duration == loan.duration).avatar} alt="" />
                      <span className="text-[11px] text-white">{collections.find((collection) => collection.address.toLowerCase() == loan.nftAddress.toLowerCase() && collection.duration == loan.duration).name}</span>
                    </div>
                    <div className="flex gap-[5px] items-center">
                      <button onClick={(e) => { onRepayOffer(index) }} className="bg-gradient-to-r from-[#159F2C] text-black py-2 text-[11px] px-4 rounded-lg to-[#DBFF00]">REPAY</button>
                      {(loan.durationCounter - Date.now() / 1000) / 86400 < 0 && <button onClick={(e) => { onLiquidateOffer(index) }} className="bg-gradient-to-r from-[#159F2C] text-black py-2 text-[11px] px-4 rounded-lg to-[#DBFF00]">LIQUIDATE</button>
                      }
                      <button disabled={loan.extends > 2} onClick={(e) => onExtendOffer(index)} className="bg-gradient-to-r from-[#159F2C] text-black px-4 py-2 rounded-lg to-[#DBFF00] text-[11px]">EXTEND</button>
                    </div>
                  </div>
                  <div className="flex gap-[5px] text-white text-[11px]">
                    <span className="w-1/4 text-center">Ŀ{formatUnits(loan.amount, 18)}</span>
                    <span className="w-1/4 text-center">{Math.abs((loan.durationCounter - Date.now() / 1000) / 86400).toFixed(2)} {(loan.durationCounter - Date.now() / 1000) / 86400 >= 0 ? "d Remaining" : "d Passed"}</span>
                    <span className="w-1/4 text-center">Ŀ{formatUnits(loan.amount * loan.interest / 1000, 18)}</span>
                    <span className="w-1/4 text-center">{(loan.duration / 86400).toFixed(2)}d</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          }
        </div>
      </div>
      {selectedLend != -1 && isRepay && !isLiquidate && !confirmed &&
        <div className={`font-superLagendBoy fixed top-0 left-0 w-[100vw] h-[100vh] flex justify-center items-center bg-[#00000030] backdrop-blur-md p-[20px] z-10`}>
          <div
            className="fixed inset-0 transition-opacity"
            onClick={() => { if (!repayPending) setSelectedLend(-1) }}
          />
          <div className="min-w-[300px] max-w-[400px] bg-[#D9D9D930] backdrop-blur-sm flex gap-[20px] flex-col rounded-[10px] p-[10px]" >
            <img className="w-full h-[125px] object-center" src={collections.find((collection) => collection.address.toLowerCase() == loans.loans[selectedLend].nftAddress.toLowerCase() && collection.duration == loans.loans[selectedLend].duration).banner} alt="banner" />
            <div className="w-full flex flex-col gap-[10px] items-center">
              <img className="w-[65px] h-[65px] object-contain rounded-full -mt-[53px]" src={collections.find((collection) => collection.address.toLowerCase() == loans.loans[selectedLend].nftAddress.toLowerCase() && collection.duration == loans.loans[selectedLend].duration).avatar} alt="avatar" />
              <span className="text-[14px] font-[400] text-white">{collections.find((collection) => collection.address.toLowerCase() == loans.loans[selectedLend].nftAddress.toLowerCase() && collection.duration == loans.loans[selectedLend].duration).name}</span>
            </div>
            <div className="w-full flex gap-[20px] justify-between">
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-[400] text-white">DAYS</span>
                <span className="text-[14px] font-[400] text-[#DBFF00]">{((loans.loans[selectedLend].durationCounter - Date.now() / 1000) / 86400).toFixed(0)}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-[400] text-white">HOURS</span>
                <span className="text-[14px] font-[400] text-white">{(((loans.loans[selectedLend].durationCounter - Date.now() / 1000) % 86400) / 3600).toFixed(0)}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-[400] text-white">MINUTES</span>
                <span className="text-[14px] font-[400] text-white">{(((loans.loans[selectedLend].durationCounter - Date.now() / 1000) % 3600) / 60).toFixed(0)}</span>
              </div>
            </div>
            <div className="w-full flex flex-col items-center">
              <span className="text-[14px] font-bold text-white">Amount Owed</span>
              <span className="text-[16px] font-bold text-white">Ŀ {formatUnits(loans.loans[selectedLend].amount * loans.loans[selectedLend].interest / 1000, 18)}</span>
            </div>
            <div className="w-full flex flex-col items-center">
              <span className="text-[16px] font-[400] text-[#f00] text-center">You'll pay back the LYX you owe and receive your NFT back</span>
            </div>
            <div className="w-full flex justify-center">
              <button disabled={repayPending} onClick={(e) => { repayOffer(); }} className="bg-gradient-to-r from-[#159F2C] text-black px-6 py-2 max-sm:text-[11px] max-sm:px-4 rounded-lg to-[#DBFF00]">REPAY {repayPending ? <FontAwesomeIcon icon={faSpinner} size="sm" className="animate-spin" /> : <></>}</button>
            </div>
          </div>
        </div>
      }
      {selectedLend != -1 && isRepay && !isLiquidate && confirmed &&
        <div className={`font-superLagendBoy fixed top-0 left-0 w-[100vw] h-[100vh] flex justify-center items-center bg-[#00000030] backdrop-blur-md p-[20px] z-10`}>
          <div
            className="fixed inset-0 transition-opacity"
            onClick={() => { setSelectedLend(-1) }}
          />
          <div className="min-w-[300px] max-w-[400px] bg-[#D9D9D930] backdrop-blur-sm flex gap-[20px] flex-col rounded-[10px] p-[10px]" >
            <img className="w-full h-[125px] object-center" src={collections.find((collection) => collection.address.toLowerCase() == loans.loans[selectedLend].nftAddress.toLowerCase() && collection.duration == loans.loans[selectedLend].duration).banner} alt="banner" />
            <div className="w-full flex flex-col gap-[10px] items-center">
              <div className="w-[65px] h-[65px] flex justify-center items-center rounded-full border-[0.25px] border-[#DBFF00] -mt-[53px] bg-[#000]">
                <svg width="37" height="28" viewBox="0 0 37 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 17.25L10.5212 27L36 1" stroke="#DBFF00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </div>
            </div>
            <span className="text-[14px] font-[400] text-white text-center">You have Successfully Repaid</span>
            <div className="flex gap-[10px] justify-center items-center">
              <span className="text-[14px] font-[400] text-white">Your loan</span>
              <span className="text-[14px] font-[400] text-[#DBFF00]">Ŀ {formatUnits(loans.loans[selectedLend].amount * loans.loans[selectedLend].interest / 1000, 18)}</span>
            </div>
            <div className="w-full flex justify-center">
              <button onClick={(e) => { setSelectedLend(-1) }} className="bg-gradient-to-r from-[#159F2C] text-black px-6 py-2 max-sm:text-[11px] max-sm:px-4 rounded-lg to-[#DBFF00]">OK</button>
            </div>
          </div>
        </div>
      }
      {selectedLend != -1 && !isRepay && isLiquidate && !confirmed &&
        <div className={`font-superLagendBoy fixed top-0 left-0 w-[100vw] h-[100vh] flex justify-center items-center bg-[#00000030] backdrop-blur-md p-[20px] z-10`}>
          <div
            className="fixed inset-0 transition-opacity"
            onClick={() => { if (!liquidatePending) setSelectedLend(-1) }}
          />
          <div className="min-w-[300px] max-w-[400px] bg-[#D9D9D930] backdrop-blur-sm flex gap-[20px] flex-col rounded-[10px] p-[10px]" >
            <img className="w-full h-[125px] object-center" src={collections.find((collection) => collection.address.toLowerCase() == loans.loans[selectedLend].nftAddress.toLowerCase() && collection.duration == loans.loans[selectedLend].duration).banner} alt="banner" />
            <div className="w-full flex flex-col gap-[10px] items-center">
              <img className="w-[65px] h-[65px] object-contain rounded-full -mt-[53px]" src={collections.find((collection) => collection.address.toLowerCase() == loans.loans[selectedLend].nftAddress.toLowerCase() && collection.duration == loans.loans[selectedLend].duration).avatar} alt="avatar" />
              <span className="text-[14px] font-[400] text-white">{collections.find((collection) => collection.address.toLowerCase() == loans.loans[selectedLend].nftAddress.toLowerCase() && collection.duration == loans.loans[selectedLend].duration).name}</span>
            </div>
            <div className="w-full flex gap-[20px] justify-between">
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-[400] text-white">DAYS</span>
                <span className="text-[14px] font-[400] text-[#DBFF00]">{((loans.loans[selectedLend].durationCounter - Date.now() / 1000) / 86400).toFixed(0)}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-[400] text-white">HOURS</span>
                <span className="text-[14px] font-[400] text-white">{(((loans.loans[selectedLend].durationCounter - Date.now() / 1000) % 86400) / 3600).toFixed(0)}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-[400] text-white">MINUTES</span>
                <span className="text-[14px] font-[400] text-white">{(((loans.loans[selectedLend].durationCounter - Date.now() / 1000) % 3600) / 60).toFixed(0)}</span>
              </div>
            </div>
            <div className="w-full flex flex-col items-center">
              <span className="text-[14px] font-bold text-white">Amount Owed</span>
              <span className="text-[16px] font-bold text-white">Ŀ {formatUnits(loans.loans[selectedLend].amount * loans.loans[selectedLend].interest / 1000, 18)}</span>
            </div>
            <div className="w-full flex flex-col items-center">
              <span className="text-[16px] font-[400] text-[#f00] text-center">You'll keep the LYX you owe and lose your NFT</span>
            </div>
            <div className="w-full flex justify-center">
              <button disabled={liquidatePending} onClick={(e) => { liquidateOffer(); }} className="bg-gradient-to-r from-[#159F2C] text-black px-6 py-2 max-sm:text-[11px] max-sm:px-4 rounded-lg to-[#DBFF00]">LIQUIDATE {liquidatePending ? <FontAwesomeIcon icon={faSpinner} size="sm" className="animate-spin" /> : <></>}</button>
            </div>
          </div>
        </div>
      }
      {selectedLend != -1 && !isRepay && isLiquidate && confirmed &&
        <div className={`font-superLagendBoy fixed top-0 left-0 w-[100vw] h-[100vh] flex justify-center items-center bg-[#00000030] backdrop-blur-md p-[20px] z-10`}>
          <div
            className="fixed inset-0 transition-opacity"
            onClick={() => { setSelectedLend(-1) }}
          />
          <div className="min-w-[300px] max-w-[400px] bg-[#D9D9D930] backdrop-blur-sm flex gap-[20px] flex-col rounded-[10px] p-[10px]" >
            <img className="w-full h-[125px] object-center" src={collections.find((collection) => collection.address.toLowerCase() == loans.loans[selectedLend].nftAddress.toLowerCase() && collection.duration == loans.loans[selectedLend].duration).banner} alt="banner" />
            <div className="w-full flex flex-col gap-[10px] items-center">
              <div className="w-[65px] h-[65px] flex justify-center items-center rounded-full border-[0.25px] border-[#DBFF00] -mt-[53px] bg-[#000]">
                <svg width="37" height="28" viewBox="0 0 37 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 17.25L10.5212 27L36 1" stroke="#DBFF00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </div>
            </div>
            <span className="text-[14px] font-[400] text-white text-center">You have Successfully Liquidated</span>
            <div className="flex gap-[10px] justify-center items-center">
              <span className="text-[14px] font-[400] text-white">Your loan</span>
              <span className="text-[14px] font-[400] text-[#DBFF00]">Ŀ {formatUnits(loans.loans[selectedLend].amount * loans.loans[selectedLend].interest / 1000, 18)}</span>
            </div>
            <div className="w-full flex justify-center">
              <button onClick={(e) => { setSelectedLend(-1) }} className="bg-gradient-to-r from-[#159F2C] text-black px-6 py-2 max-sm:text-[11px] max-sm:px-4 rounded-lg to-[#DBFF00]">OK</button>
            </div>
          </div>
        </div>
      }
      {selectedLend != -1 && !isRepay && !isLiquidate && !confirmed &&
        <div className={`font-superLagendBoy fixed top-0 left-0 w-[100vw] h-[100vh] flex justify-center items-center bg-[#00000030] backdrop-blur-md p-[20px] z-10`}>
          <div
            className="fixed inset-0 transition-opacity"
            onClick={() => { if (!extendPending) setSelectedLend(-1) }}
          />
          <div className="min-w-[300px] max-w-[400px] bg-[#D9D9D930] backdrop-blur-sm flex gap-[20px] flex-col rounded-[10px] p-[10px]" >
            <img className="w-full h-[125px] object-center" src={collections.find((collection) => collection.address.toLowerCase() == loans.loans[selectedLend].nftAddress.toLowerCase() && collection.duration == loans.loans[selectedLend].duration).banner} alt="banner" />
            <div className="w-full flex flex-col gap-[10px] items-center">
              <img className="w-[65px] h-[65px] object-contain rounded-full -mt-[53px]" src={collections.find((collection) => collection.address.toLowerCase() == loans.loans[selectedLend].nftAddress.toLowerCase() && collection.duration == loans.loans[selectedLend].duration).avatar} alt="avatar" />
              <span className="text-[14px] font-[400] text-white">{collections.find((collection) => collection.address.toLowerCase() == loans.loans[selectedLend].nftAddress.toLowerCase() && collection.duration == loans.loans[selectedLend].duration).name}</span>
            </div>
            <div className="w-full flex gap-[20px] justify-between">
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-[400] text-white">DAYS</span>
                <span className="text-[14px] font-[400] text-[#DBFF00]">{((loans.loans[selectedLend].durationCounter - Date.now() / 1000) / 86400).toFixed(0)}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-[400] text-white">HOURS</span>
                <span className="text-[14px] font-[400] text-white">{(((loans.loans[selectedLend].durationCounter - Date.now() / 1000) % 86400) / 3600).toFixed(0)}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-[400] text-white">MINUTES</span>
                <span className="text-[14px] font-[400] text-white">{(((loans.loans[selectedLend].durationCounter - Date.now() / 1000) % 3600) / 60).toFixed(0)}</span>
              </div>
            </div>
            <div className="w-full flex flex-col gap-[10px] px-[20px]">
              <span className="text-[10px] text-white">Here are the NFTs you borrowed against. You must pay these in full by the expiration date in order to keep your NFT.</span>
            </div>
            <div className="w-full flex flex-col items-center">
              <span className="text-[14px] font-bold text-white">Amount Owed</span>
              <span className="text-[16px] font-bold text-white">Ŀ {formatUnits(loans.loans[selectedLend].amount * loans.loans[selectedLend].interest / 1000, 18)}</span>
            </div>
            <div className="w-full flex flex-col items-center">
              <span className="text-[14px] font-bold text-white">Extend Days (7 days at least)</span>
              <input type='number' value={extendDays} onChange={(e) => { if (Number(e.target.value) < 7) setExtendDays("7"); else { setExtendDays(e.target.value); } }} placeholder="0" className="w-[120px] text-[14px] text-white bg-[#D9D9D930] border border-[#DBFF0030] rounded-[10px] focus:outline-none px-[20px] py-[5px]" />
            </div>
            <div className="w-full flex justify-center">
              <button disabled={extendPending} onClick={(e) => { extendOffer() }} className="bg-gradient-to-r from-[#159F2C] text-black px-6 py-2 max-sm:text-[11px] max-sm:px-4 rounded-lg to-[#DBFF00]">
                EXTEND {extendPending ? <FontAwesomeIcon icon={faSpinner} size="sm" className="animate-spin" /> : <></>}</button>
            </div>
          </div>
        </div>
      }
      {selectedLend != -1 && !isRepay && !isLiquidate && confirmed &&
        <div className={`font-superLagendBoy fixed top-0 left-0 w-[100vw] h-[100vh] flex justify-center items-center bg-[#00000030] backdrop-blur-md p-[20px] z-10`}>
          <div
            className="fixed inset-0 transition-opacity"
            onClick={() => { setSelectedLend(-1) }}
          />
          <div className="min-w-[300px] max-w-[400px] bg-[#D9D9D930] backdrop-blur-sm flex gap-[20px] flex-col rounded-[10px] p-[10px]" >
            <img className="w-full h-[125px] object-center" src={collections.find((collection) => collection.address.toLowerCase() == loans.loans[selectedLend].nftAddress.toLowerCase() && collection.duration == loans.loans[selectedLend].duration).banner} alt="banner" />
            <div className="w-full flex flex-col gap-[10px] items-center">
              <div className="w-[65px] h-[65px] flex justify-center items-center rounded-full border-[0.25px] border-[#DBFF00] -mt-[53px] bg-[#000]">
                <svg width="37" height="28" viewBox="0 0 37 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 17.25L10.5212 27L36 1" stroke="#DBFF00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </div>
            </div>
            <span className="text-[14px] font-[400] text-white text-center">You have Successfully Extend</span>
            <div className="flex gap-[10px] justify-center items-center">
              <span className="text-[14px] font-[400] text-white">Your offer for</span>
              <span className="text-[14px] font-[400] text-[#DBFF00]">{extendDays}</span>
              <span className="text-[14px] font-[400] text-white">day(s)</span>
            </div>
            <div className="w-full flex justify-center">
              <button onClick={(e) => { setSelectedLend(-1) }} className="bg-gradient-to-r from-[#159F2C] text-black px-6 py-2 max-sm:text-[11px] max-sm:px-4 rounded-lg to-[#DBFF00]">OK</button>
            </div>
          </div>
        </div>
      }
    </>
  )
}

export default Loans