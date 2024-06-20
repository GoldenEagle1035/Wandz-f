import React, { useEffect, useState, useRef, useContext } from "react";
import Nav from "../global/Nav";
import VideoBG from "../global/VideoBG";
import { MdArrowDownward } from "react-icons/md";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { CSVLink } from "react-csv";
import LendDlgBanner from "../../assets/background/lendDlgBanner.png";

import { useAccount } from 'wagmi';

import { parseEther, formatUnits } from 'viem';

import { LoansContext } from "../../context/loan-context";
import { CollectionsContext } from "../../context/collection-context";
import { wagmiConfig } from "../../services/web3/wagmiConfig";
// import { collections } from "../../data/collections";

function Offers() {

  const [selectedLend, setSelectedLend] = useState(-1);
  const [revokePending, setRevokePending] = useState(false);
  const [downloadData, setDownloadData] = useState([]);
  const [confirmed, setConfirmed] = useState(false);

  const [showMore, setShowMore] = useState(false);

  const csvRef = useRef(null);

  const account = useAccount();

  const loans = useContext(LoansContext);
  const { collections, isLoading: isLoadingCollection } = useContext(CollectionsContext);

  const onRevokeOffer = (lendIndex) => {
    setSelectedLend(lendIndex);
    setConfirmed(false);
  }

  const revokeOffer = async () => {
    if (account.address) {
      setRevokePending(true);
      try {

        const result = await loans.revokeLoan({
          args: [loans.loans[selectedLend].loanId],
          from: account.address
        })
        await loans.waitForTransactionReceipt(wagmiConfig, { hash: result });
        console.log("revokeLoan:", result);
        setConfirmed(true);
      } catch (error) {
        console.log(error);
        setSelectedLend(-1);
      }
      setRevokePending(false);
    }
  }

  const onDownloadCSV = () => {
    csvRef.current.link.click();
  }

  useEffect(() => {
    if (!isLoadingCollection) {
      let data = [];
      loans.loans.filter((loan) => account.address && loan.lender.toLowerCase() == account.address.toLowerCase() && loan.amount != 0 && !loan.accepted && !loan.paid && !loan.liquidated).map((loan) => {
        data.push({
          COLLECTION: collections.find((collection) => collection.address.toLowerCase() == loan.nftAddress.toLowerCase() && collection.duration == loan.duration).name,
          Offer: 'θ' + formatUnits(loan.amount, 18),
          Reward: 'θ' + formatUnits(loan.amount * loan.interest / 1000, 18),
          APY: (loan.interest / 10 - 100) + "%",
          Status: 'Seeking Borrower'
        })
      })
      setDownloadData(data);
    }
  }, [loans.loans, isLoadingCollection])

  return (
    <>
      <div className="offers-page pb-[30px]">
        {/* <VideoBG /> */}
        <Nav btnText={"Select Profile"} />
        <div className="container relative">
          <div className="text-section font-superLagendBoy text-center pt-36 pb-20">
            <h1 className="text-[2.5rem] sm:text-[2rem] max-sm:text-[1.5rem] sm:p-4 text-gradient-bg leading-loose">
              MY OFFERS AND CONTRACTS
            </h1>
            <p className="max-sm:hidden font-superLagendBoy text-xl max-sm:text-lg text-[#FFFFFF]">
              Once your offer is accepted by a borrower, a secure contract is created, freezing the NFT in their wallet. When the loan ends, you will get paid the total LYX (loan with interest). In the event of a default, you can foreclose, which transfers the collateral NFT to your wallet.
            </p>
            <div className="hidden max-sm:flex flex-col gap-[10px] items-center">
              {showMore ? <p className="font-superLagendBoy text-xl max-sm:text-lg text-[#FFFFFF]">
                Once your offer is accepted by a borrower, a secure contract is created, freezing the NFT in their wallet. When the loan ends, you will get paid the total LYX (loan with interest). In the event of a default, you can foreclose, which transfers the collateral NFT to your wallet.
              </p> : <>
                <p className="font-superLagendBoy text-xl max-sm:text-lg text-[#FFFFFF]">
                  Once your offer is accepted by a borrower, a secure contract is created, freezing the NFT in their wallet.
                </p>
                <button onClick={(e) => setShowMore(true)} className="font-superLagendBoy text-xl max-sm:text-lg text-[#DBFF00] underline">Show More</button>
              </>}
            </div>
            {loans.loans.filter((loan) => account.address && loan.lender.toLowerCase() == account.address.toLowerCase() && loan.amount != 0 && !loan.accepted && !loan.paid && !loan.liquidated).length == 0 && <h1 className="mt-24 font-superLagendBoy text-4xl max-sm:text-lg text-[#FFFFFF]">No active or completed offers.</h1>}
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
                  filename="offers_history.csv"
                  className="hidden"
                  ref={csvRef}
                  target="_blank"
                />
              </h1>
            </div>

            <div className="boxes max-sm:px-2">
              <div className="flex max-sm:flex-col gap-4 max-sm:gap-4 justify-between ">
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

                <div className="text-[#FFFFFF] rounded-lg border border-[#DBFF00] border-b-[6px] font-superLagendBoy bg-[#45291D50] backdrop-blur-xl p-6 py-6 pr-10 flex flex-col">
                  <h1 className="text-[10px]">
                    TOTAL OFFER VALUE
                  </h1>
                  <div className="flex flex-col justify-between mt-4">
                    <h1 className="flex gap-2 items-center">
                      <span className="text-xl">{formatUnits(loans.loans.filter((loan) => loan.amount != 0 && !loan.accepted && !loan.paid && !loan.liquidated).reduce((total, loan) => total + loan.amount, 0), 18)}</span>
                      <span className="text-3xl">LYX</span>
                    </h1>
                    <span className="text-[10px]">{loans.loans.filter((loan) => loan.amount != 0 && !loan.accepted && !loan.paid && !loan.liquidated).length} offers</span>
                  </div>
                </div>

                {/* <div className="text-[#FFFFFF] rounded-lg border border-[#DBFF00] border-b-[6px] font-superLagendBoy backdrop-blur-3xl p-6 py-6 pr-10 flex flex-col">
                  <h1 className="text-[10px]">
                    FACECLOSURE RATE
                  </h1>
                  <div className="flex flex-col justify-between mt-4">
                    <h1 className="flex gap-2 items-center">
                      <span className="text-3xl">θ</span>
                      <span className="text-xl">0</span>
                    </h1>
                    <span className="text-[10px]">0 active loans</span>
                  </div>
                </div> */}

                <div className="text-[#FFFFFF] rounded-lg border border-[#DBFF00] border-b-[6px] font-superLagendBoy backdrop-blur-3xl p-6 py-6 pr-10 flex flex-col">
                  <h1 className="text-[10px]">
                    UNDER WATER
                  </h1>
                  <div className="flex flex-col justify-between mt-4">
                    <h1 className="flex gap-2 items-center">
                      <span className="text-3xl">{loans.loans.filter((loan) => loan.amount != 0 && loan.liquidated).length}</span>
                      <span className="text-xl">loans</span>
                    </h1>
                    {/* <span className="text-[10px]">0 active loans</span> */}
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
          {!isLoadingCollection && loans.loans.filter((loan) => account.address && loan.lender.toLowerCase() == account.address.toLowerCase() && loan.amount != 0 && !loan.accepted && !loan.paid && !loan.liquidated).length != 0 &&
            <div className="max-sm:hidden px-6 overflow-x-auto bg-[#45291D50] backdrop-blur-xl text-left font-superLagendBoy text-[#FFFFFF] my-12 rounded-xl border-none">
              <table className="w-full p-10">
                <thead>
                  <tr className="max-sm:text-[11px]">
                    <th className="p-6">Collection</th>
                    <th className="pl-4 max-sm:px-4">Offer</th>
                    <th className="pl-4 max-sm:px-4">Reward</th>
                    <th className="pl-4 max-sm:px-4">APY</th>
                    <th className="pl-4 max-sm:px-4">Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {loans.loans.map((loan, index) => (
                    account.address && loan.lender.toLowerCase() == account.address.toLowerCase() && loan.amount != 0 && !loan.accepted && !loan.paid && !loan.liquidated && <tr className=" py-10 border-b-[1px] max-sm:px-4 border-[#a9a9a9d8]">
                      <td className="p-4 pl-4 max-sm:px-4 flex gap-2 items-center max-sm:text-[11px]">
                        <span className="max-sm:w-6">
                          <img className="w-[40px] h-[40px] object-contain rounded-full" src={collections.find((collection) => collection.address.toLowerCase() == loan.nftAddress.toLowerCase() && collection.duration == loan.duration).avatar} alt="" />
                        </span>
                        {collections.find((collection) => collection.address.toLowerCase() == loan.nftAddress.toLowerCase() && collection.duration == loan.duration).name}
                      </td>
                      <td className=" pl-4 max-sm:text-[11px] max-sm:px-4">
                        <span className="text-[12px] font-bold text-white text-nowrap">θ {formatUnits(loan.amount, 18)}</span>
                      </td>
                      <td className="max-sm:text-[11px] pl-4 max-sm:px-4">
                        <span className="text-[12px] font-bold text-white text-nowrap">θ {formatUnits(loan.amount * loan.interest / 1000, 18)}</span>
                      </td>
                      <td className="max-sm:text-[11px] pl-4 max-sm:px-4">
                        <span className="text-[12px] font-bold text-white">{loan.interest / 10 - 100}</span>
                        <span className="text-[12px] font-bold text-white">%</span>
                      </td>
                      <td className="ml-6 max-sm:text-[11px] pl-4 max-sm:px-4">
                        <span className="text-[12px] font-bold text-white">Seeking Borrower</span>
                      </td>
                      <td>
                        <button onClick={(e) => { onRevokeOffer(index) }} className="bg-gradient-to-r from-[#159F2C] text-black px-6 py-2 max-sm:text-[11px] max-sm:px-4 rounded-lg to-[#DBFF00]">REVOKE</button>
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
              <span className="w-1/4 text-center">Reward</span>
              <span className="w-1/4 text-center">APY</span>
              <span className="w-1/4 text-center">Status</span>
            </div>
            <div className="flex flex-col">
              {loans.loans.map((loan, index) => (
                account.address && loan.lender.toLowerCase() == account.address.toLowerCase() && loan.amount != 0 && !loan.accepted && !loan.paid && !loan.liquidated &&
                <div className="py-4 border-b-[1px] border-[#a9a9a9d8] flex flex-col gap-[5px]">
                  <div className="flex gap-[10px] justify-between items-center">
                    <div className="flex gap-[5px] items-center">
                      <img className="w-[40px] h-[40px] object-contain rounded-full" src={collections.find((collection) => collection.address.toLowerCase() == loan.nftAddress.toLowerCase() && collection.duration == loan.duration).avatar} alt="" />
                      <span className="text-[11px] text-white">{collections.find((collection) => collection.address.toLowerCase() == loan.nftAddress.toLowerCase() && collection.duration == loan.duration).name}</span>
                    </div>
                    <button onClick={(e) => onRevokeOffer(index)} className="bg-gradient-to-r from-[#159F2C] text-black px-4 py-2 rounded-lg to-[#DBFF00] text-[11px]">REVOKE</button>
                  </div>
                  <div className="flex gap-[5px] text-white text-[11px]">
                    <span className="w-1/4 text-center">θ {formatUnits(loan.amount, 18)}</span>
                    <span className="w-1/4 text-center">θ {formatUnits(loan.amount * loan.interest / 1000, 18)}</span>
                    <span className="w-1/4 text-center">{loan.interest / 10 - 100} %</span>
                    <span className="w-1/4 text-center">Seeking Borrower</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          }
        </div>
      </div>
      {selectedLend != -1 && !confirmed &&
        <div className={`font-superLagendBoy fixed top-0 left-0 w-[100vw] h-[100vh] flex justify-center items-center bg-[#00000030] backdrop-blur-md p-[20px] z-10`}>
          <div
            className="fixed inset-0 transition-opacity"
            onClick={() => { if (!revokePending) setSelectedLend(-1) }}
          />
          <div className="min-w-[300px] max-w-[400px] bg-[#D9D9D930] backdrop-blur-sm flex gap-[20px] flex-col rounded-[10px] p-[10px]" >
            <img className="w-full h-[125px] object-center" src={collections.find((collection) => collection.address.toLowerCase() == loans.loans[selectedLend].nftAddress.toLowerCase() && collection.duration == loans.loans[selectedLend].duration).banner} alt="banner" />
            <div className="w-full flex flex-col gap-[10px] items-center">
              <img className="w-[65px] h-[65px] object-contain rounded-full -mt-[53px]" src={collections.find((collection) => collection.address.toLowerCase() == loans.loans[selectedLend].nftAddress.toLowerCase() && collection.duration == loans.loans[selectedLend].duration).avatar} alt="avatar" />
              <span className="text-[14px] font-[400] text-white">{collections.find((collection) => collection.address.toLowerCase() == loans.loans[selectedLend].nftAddress.toLowerCase() && collection.duration == loans.loans[selectedLend].duration).name}</span>
            </div>
            <div className="w-full flex gap-[20px] justify-between">
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-[400] text-white">APY</span>
                <span className="text-[14px] font-[400] text-[#DBFF00]">{loans.loans[selectedLend].interest / 10 - 100}%</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-[400] text-white">DURATION</span>
                <span className="text-[14px] font-[400] text-white">{(loans.loans[selectedLend].duration / 86400).toFixed(2)}d</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-[400] text-white">FLOOR</span>
                <span className="text-[14px] font-[400] text-white"><span className="text-[14px] font-[400] text-white">θ {loans.loans.filter((loan) => loan.nftAddress.toLowerCase() == loans.loans[selectedLend].nftAddress.toLowerCase() && loan.amount != 0 && !loan.accepted && !loan.paid && !loan.liquidated).length == 0 ? 0 : formatUnits(loans.loans.filter((loan) => loan.nftAddress.toLowerCase() == loans.loans[selectedLend].nftAddress.toLowerCase() && loan.amount != 0 && !loan.accepted && !loan.paid && !loan.liquidated).sort((a, b) => a.amount - b.amount).at(0).amount, 18)}</span></span>
              </div>
            </div>
            <div className="w-full flex flex-col gap-[10px]">
              <span className="text-[10px] font-bold text-white">Status</span>
              <span className="text-[14px] font-bold text-white">Seeking Borrower</span>
            </div>
            <div className="w-full flex justify-between items-center">
              <span className="text-[14px] font-bold text-white">Offer Amount</span>
              <div className="flex flex-col items-center">
                <span className="text-[16px] font-bold text-white">θ {formatUnits(loans.loans[selectedLend].amount, 18)}</span>
              </div>
            </div>
            <div className="w-full flex justify-center">
              <button disabled={revokePending} onClick={(e) => { revokeOffer() }} className="bg-gradient-to-r from-[#159F2C] text-black px-6 py-2 max-sm:text-[11px] max-sm:px-4 rounded-lg to-[#DBFF00]">
                REVOKE {revokePending ? <FontAwesomeIcon icon={faSpinner} size="sm" className="animate-spin" /> : <></>}</button>
            </div>
          </div>
        </div>
      }
      {selectedLend != -1 && confirmed &&
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
            <span className="text-[14px] font-[400] text-white text-center">You have Successfully Revoke</span>
            {/* <div className="flex gap-[10px] justify-center items-center">
              <span className="text-[14px] font-[400] text-white">your offer of</span>
              <span className="text-[14px] font-[400] text-[#DBFF00]">θ {formatUnits(loans.loans[selectedLend].amount, 18)}</span>
            </div> */}
            <div className="w-full flex gap-[20px] justify-between">
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-[400] text-white">APY</span>
                <span className="text-[14px] font-[400] text-[#DBFF00]">{loans.loans[selectedLend].interest / 10 - 100}%</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-[400] text-white">DURATION</span>
                <span className="text-[14px] font-[400] text-white">{(loans.loans[selectedLend].duration / 86400).toFixed(2)}d</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-[400] text-white">FLOOR</span>
                <span className="text-[14px] font-[400] text-white"><span className="text-[14px] font-[400] text-white">θ {loans.loans.filter((loan) => loan.nftAddress.toLowerCase() == loans.loans[selectedLend].nftAddress.toLowerCase() && loan.amount != 0 && !loan.accepted && !loan.paid && !loan.liquidated).length == 0 ? 0 : formatUnits(loans.loans.filter((loan) => loan.nftAddress.toLowerCase() == loans.loans[selectedLend].nftAddress.toLowerCase() && loan.amount != 0 && !loan.accepted && !loan.paid && !loan.liquidated).sort((a, b) => a.amount - b.amount).at(0).amount, 18)}</span></span>
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

export default Offers;
