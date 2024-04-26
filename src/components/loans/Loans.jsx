import React, { useEffect, useState, useRef } from "react";
import Nav from "../global/Nav";
import VideoBG from "../global/VideoBG";
import { MdArrowDownward } from "react-icons/md";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { CSVLink } from "react-csv";
import LendDlgBanner from "../../assets/background/lendDlgBanner.png";

import { collections } from "../../data/collections";

import { useAccount } from 'wagmi';
import { readContract } from '@wagmi/core'
import { parseEther, formatUnits } from 'viem';
import { useLoans, useAccountBalance } from "../../hooks/wandz-eth";

function Loans() {

  const [selectedLend, setSelectedLend] = useState(-1);
  const [repayPending, setRepayPending] = useState(false);
  const [downloadData, setDownloadData] = useState([]);

  const csvRef = useRef(null);

  const account = useAccount();

  const loans = useLoans();

  const { balance, isError, isLoading } = useAccountBalance(account.address);

  const onRepayOffer = (lendIndex) => {
    setSelectedLend(lendIndex);
  }

  const repayOffer = async () => {
    if (account.address) {
      setRepayPending(true);
      try {
        const result = await loans.repayLoan({
          args: [loans.loans[selectedLend].loanId],
          value: parseEther(formatUnits(loans.loans[selectedLend].amount * loans.loans[selectedLend].interest / 100, 18)),
          from: account.address
        })
        console.log("repayLoan:", result);
      } catch (error) {
        console.log(error);
      }
      setRepayPending(false);
      setSelectedLend(-1);
    }
  }

  const liquidateOffer = async () => {
    if (account.address) {
      setRepayPending(true);
      try {
        const result = await loans.liquidateLoan({
          args: [loans.loans[selectedLend].loanId],
          from: account.address
        })
        console.log("liquidateLoan:", result);
      } catch (error) {
        console.log(error);
      }
      setRepayPending(false);
      setSelectedLend(-1);
    }
  }

  const onDownloadCSV = () => {
    csvRef.current.link.click();
  }

  useEffect(() => {
    let data = [];
    loans.loans.filter((loan) => loan.borrower == account.address && loan.accepted && !loan.paid && !loan.liquidated).map((loan) => {
      data.push({
        COLLECTION: collections.find((collection) => collection.address == loan.nftAddress).name,
        BORROWED: 'Ŀ' + formatUnits(loan.amount, 18),
        TERM: Math.abs((loan.durationCounter - Date.now() / 1000) / 86400).toFixed(2) + (loan.durationCounter - Date.now() / 1000) / 86400 >= 0 ? "d Remaining" : "d Passed",
        REPAYMENT: 'Ŀ' + formatUnits(loan.amount * loan.interest / 100, 18),
      })
    })
    setDownloadData(data);
  }, [loans.loans])

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
            <p className="font-superLagendBoy text-xl max-sm:text-lg text-[#FFFFFF]">
              Here are the NFTs you borrowed against. You must pay these in full by the expiration date in order to keep your NFT.
            </p>
            {loans.loans.filter((loan) => loan.borrower == account.address && loan.accepted && !loan.paid && !loan.liquidated).length == 0 && <h1 className="mt-24 font-superLagendBoy text-4xl max-sm:text-lg text-[#FFFFFF]">No active or completed loans.</h1>}
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
                      <span className="text-4xl">{loans.loans.filter((loan) => loan.borrower == account.address && loan.accepted && !loan.paid && !loan.liquidated).length} loans</span>
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
                        <span className="text-4xl">Ŀ </span>
                        <span className="text-2xl">{formatUnits(loans.loans.filter((loan) => loan.borrower == account.address && loan.accepted && !loan.paid && !loan.liquidated).reduce((total, loan) => total + loan.amount, 0), 18)}</span>
                      </p>
                      <span className="text-sm">Ŀ {!account.address || isLoading || isError || balance == null ? 0 : balance.toFixed(2)} in wallet</span>
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
                      <span className="text-4xl">Ŀ </span>
                      <span className="text-2xl">{formatUnits(loans.loans.filter((loan) => loan.borrower == account.address && loan.accepted && !loan.paid && !loan.liquidated).reduce((total, loan) => total + loan.amount * (loan.interest - 100), 0), 18)}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {loans.loans.filter((loan) => loan.borrower == account.address && loan.accepted && !loan.paid && !loan.liquidated).length != 0 &&
            <div className="flex flex-col gap-[20px] rounded-[30px] bg-[#383D7257] backdrop-blur-sm p-[30px]">
              <div className="flex items-center gap-[10px]">
                <span className="w-1/5 text-[16px] font-bold text-white">COLLECTION</span>
                <span className="w-1/5 text-[16px] font-bold text-white">BORROWED</span>
                <span className="w-1/5 text-[16px] font-bold text-white">TERM</span>
                <span className="w-1/5 text-[16px] font-bold text-white">REPAYMENT</span>
                <span className="w-1/5 text-[16px] font-bold text-white"></span>
              </div>
              <div className="flex flex-col gap-[10px]">
                {loans.loans.map((item, index) => (
                  item.borrower == account.address && item.accepted && !item.paid && !item.liquidated && <div className="flex items-center gap-[10px]">
                    <div className="w-1/5 flex gap-[20px] items-center">
                      <img className="w-[35px] h-[35px] object-contain" src={collections.find((collection) => collection.address == item.nftAddress).avatar} alt="loan" />
                      <span className="text-[11px] font-bold text-white">{collections.find((collection) => collection.address == item.nftAddress).name}</span>
                    </div>
                    <div className="w-1/5 flex gap-[5px] items-center">
                      <span className="text-[12px] font-bold text-white">Ŀ</span>
                      <span className="text-[12px] font-bold text-[#DBFF00]">{formatUnits(item.amount, 18)}</span>
                    </div>
                    <div className="w-1/5 flex gap-[5px] items-center">
                      <span className="text-[12px] font-bold text-white">{Math.abs((item.durationCounter - Date.now() / 1000) / 86400).toFixed(2)} {(item.durationCounter - Date.now() / 1000) / 86400 >= 0 ? "d Remaining" : "d Passed"}</span>
                    </div>
                    <div className="w-1/5 flex gap-[5px] items-center">
                      <span className="text-[12px] font-bold text-white">Ŀ</span>
                      <span className="text-[12px] font-bold text-[#DBFF00]">{formatUnits(item.amount * item.interest / 100, 18)}</span>
                    </div>
                    <div className="w-1/5 flex gap-[5px] items-center">
                      <button onClick={(e) => { onRepayOffer(index) }} className="bg-gradient-to-r from-[#159F2C] text-black px-6 py-2 max-sm:text-[11px] max-sm:px-4 rounded-lg to-[#DBFF00]">{(item.durationCounter - Date.now() / 1000) / 86400 >= 0 ? "REPAY" : "LIQUIDATE"}</button>
                    </div>
                  </div>
                )
                )}
              </div>
            </div>}
        </div>
      </div>
      {selectedLend != -1 &&
        <div className={`fixed top-0 left-0 w-[100vw] h-[100vh] flex justify-center items-center bg-[#00000030] backdrop-blur-md p-[20px] z-10`}>
          <div
            className="fixed inset-0 transition-opacity"
            onClick={() => { if (!repayPending) setSelectedLend(-1) }}
          />
          <div className="min-w-[300px] bg-[#D9D9D930] backdrop-blur-sm flex gap-[20px] flex-col rounded-[10px] p-[10px]" >
            <img className="w-full h-[125px] object-center" src={LendDlgBanner} alt="LendDlgBanner" />
            <div className="w-full flex flex-col gap-[10px] items-center">
              <img className="w-[65px] h-[65px] object-contain rounded-full -mt-[53px]" src={collections.find((collection) => collection.address == loans.loans[selectedLend].nftAddress).avatar} alt="avatar" />
              <span className="text-[14px] font-[400] text-white">{collections.find((collection) => collection.address == loans.loans[selectedLend].nftAddress).name}</span>
            </div>
            <div className="w-full flex gap-[20px] justify-between">
              <div className="flex flex-col items-center">
                <span className="text-[6px] font-[400] text-white">DAYS</span>
                <span className="text-[14px] font-[400] text-[#DBFF00]">{((loans.loans[selectedLend].durationCounter - Date.now() / 1000) / 86400).toFixed(0)}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[6px] font-[400] text-white">HOURS</span>
                <span className="text-[14px] font-[400] text-white">{(((loans.loans[selectedLend].durationCounter - Date.now() / 1000) % 86400) / 3600).toFixed(0)}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[6px] font-[400] text-white">MINUTES</span>
                <span className="text-[14px] font-[400] text-white">{(((loans.loans[selectedLend].durationCounter - Date.now() / 1000) % 3600) / 60).toFixed(0)}</span>
              </div>
            </div>
            <div className="w-full flex flex-col gap-[10px] px-[20px]">
              <span className="text-[6px] text-white">Here are the NFTs you borrowed against. You must pay these in full by the expiration date in order to keep your NFT.</span>
            </div>
            <div className="w-full flex flex-col items-center">
              <span className="text-[16px] font-bold text-white">Amount Owed</span>
              <span className="text-[20px] font-bold text-white">Ŀ {formatUnits(loans.loans[selectedLend].amount * loans.loans[selectedLend].interest / 100, 18)}</span>
            </div>
            <div className="w-full flex justify-center">
              <button disabled={repayPending} onClick={(e) => { if ((loans.loans[selectedLend].durationCounter - Date.now() / 1000) / 86400 >= 0) { repayOffer(); } else { liquidateOffer(); } }} className="bg-gradient-to-r from-[#159F2C] text-black px-6 py-2 max-sm:text-[11px] max-sm:px-4 rounded-lg to-[#DBFF00]">
                {(loans.loans[selectedLend].durationCounter - Date.now() / 1000) / 86400 >= 0 ? "REPAY" : "LIQUIDATE"} {repayPending ? <FontAwesomeIcon icon={faSpinner} size="sm" className="animate-spin" /> : <></>}</button>
            </div>
          </div>
        </div>
      }
    </>
  )
}

export default Loans