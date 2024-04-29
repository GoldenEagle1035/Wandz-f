import React, { useEffect, useState } from "react";
import VideoBG from "../global/VideoBG";
import Nav from "../global/Nav";
import { FiSearch, FiFilter } from "react-icons/fi";
import Filter from "../../assets/icons/Filter.png";
import { tableData } from "../data/data";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import defaultBanner from "../../assets/banners/default.webp";

import { collections } from "../../data/collections";

import { useAccount } from 'wagmi';
import { readContract, writeContract } from '@wagmi/core'
import { parseEther, formatUnits } from 'viem';
import { useLoans } from "../../hooks/wandz-eth";

import lsp8Abi from '../../lukso/abis/lsp8_abi.json';

function Borrow() {

  const [selectedLend, setSelectedLend] = useState(-1);
  const [selectedTokenId, setSelectedTokenId] = useState('-1');
  const [tokenIds, setTokenIds] = useState([]);
  const [isApproved, setIsApproved] = useState(false);
  const [acceptPending, setAcceptPending] = useState(false);
  const [approvePending, setApprovePending] = useState(false);

  const [searchValue, setSearchValue] = useState('');

  const account = useAccount();

  const loans = useLoans();

  const onAcceptOffer = (lendIndex) => {
    setSelectedTokenId('-1');
    setTokenIds([]);
    setIsApproved(false);
    setSelectedLend(lendIndex);
  }

  const acceptOffer = async () => {
    if (account.address) {
      setAcceptPending(true);
      try {
        const result = await loans.acceptLoan({
          args: [loans.loans[selectedLend].loanId, selectedTokenId],
          from: account.address
        })
        console.log("acceptLoan:", result);
      } catch (error) {
        console.log(error);
      }
      setAcceptPending(false);
      setSelectedLend(-1);
    }
  }

  const authorizeLSP8 = async () => {
    try {
      setApprovePending(true);
      const result = await writeContract({
        address: loans.loans[selectedLend].nftAddress,
        abi: lsp8Abi,
        functionName: 'authorizeOperator',
        args: [loans.lendAddress, selectedTokenId, "0x0"]
      })
      console.log("authorizeOperator:", result);
      setIsApproved(true);
    } catch (error) {
      console.log(error);
    }
    setApprovePending(false);
  }

  const onSelectToken = async (tokenId) => {
    setSelectedTokenId(tokenId);
    try {
      setAcceptPending(true);
      setApprovePending(true);
      const is_approved = await readContract({
        address: loans.loans[selectedLend].nftAddress,
        abi: lsp8Abi,
        functionName: 'isOperatorFor',
        args: [loans.lendAddress, tokenId]
      });
      console.log("isOperatorFor:", is_approved);
      setIsApproved(is_approved);
    } catch (error) {
      console.log(error);
    }
    setAcceptPending(false);
    setApprovePending(false);
  }

  const fetchTokenIds = async () => {
    try {
      const tokenIds = await readContract({
        address: loans.loans[selectedLend].nftAddress,
        abi: lsp8Abi,
        functionName: 'tokenIdsOf',
        args: [account.address]
      });
      console.log("tokenIds:", tokenIds);
      setTokenIds(tokenIds);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    if (selectedLend != -1) {
      fetchTokenIds();
    }
  }, [selectedLend])

  return (
    <>
      <div className="lend-section">
        <div className="main-page">
          {/* <VideoBG /> */}
          <Nav btnText={"Select Profile"} />
          <div className="container relative">
            <div className="text-section font-superLagendBoy text-center pt-36 pb-20">
              <h1 className="text-[2.5rem] sm:text-[2rem] max-sm:text-[1.5rem] sm:p-4 text-gradient-bg leading-loose">
                Borrow against my NFTs
              </h1>
              <p className="font-superLagendBoy text-xl max-sm:text-lg text-[#FFFFFF]">
                Instantly take a loan against your NFTs. Escrow-free loans allows you to keep the collateral NFT in your wallet. When you accept a loan offer, a secure contract is created, freezing the NFT in-wallet. Not repaying by the due date means the lender can repossess your NFT. Successfully pay the loan in full by the expiration date to automatically thaw the NFT.
              </p>
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
                {/* <div className="filters">
                  <button className="flex font-superLagendBoy text-white  gap-2 justify-center border border-[#DBFF00] rounded-lg p-1 px-2">
                    <img src={Filter} alt="filter-option" />
                    <h1 className="text-sm">Filter</h1>
                  </button>
                </div> */}
              </div>
              <div className="px-6 overflow-x-auto bg-[#45291D50] backdrop-blur-xl text-left font-superLagendBoy text-[#FFFFFF] my-12 rounded-xl border-none">
                <table className="w-full p-10">
                  <thead>
                    <tr className="max-sm:text-[11px] max-sm:px-4">
                      <th className="p-6 max-sm:px-4">Collection</th>
                      <th className="pl-4 max-sm:px-4">Available Pool</th>
                      <th className="pl-4 max-sm:px-4">Best offer</th>
                      <th className="pl-4 max-sm:px-4">APY</th>
                      <th className="pl-6 max-sm:px-4">Duration</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {loans.loans.map((item, index) => (
                      item.amount != 0 && !item.accepted && !item.paid && !item.liquidated && collections.find((collection) => collection.address == item.nftAddress).name.includes(searchValue) &&
                      <tr className=" py-10 border-b-[1px] border-[#a9a9a9d8] max-sm:px-4  ">
                        <td className="p-4 pl-4 flex gap-2 items-center max-sm:text-[11px] max-sm:px-4">
                          <span className="max-sm:w-6 ">
                            <img className="w-[40px] h-[40px] object-contain rounded-full" src={collections.find((collection) => collection.address == item.nftAddress).avatar} alt="" />
                          </span>
                          {collections.find((collection) => collection.address == item.nftAddress).name}
                        </td>
                        <td className=" max-sm:px-4 pl-4 max-sm:text-[11px]">
                          <span className="text-lg mr-1">Ŀ</span>{formatUnits(loans.loans.filter((t_item) => t_item.nftAddress == item.nftAddress && t_item.amount != 0 && !t_item.accepted && !t_item.paid && !t_item.liquidated).reduce(((total, tt_item) => total + tt_item.amount), 0), 18)}
                          <br />
                          <span className="text-[9px]  max-sm:text-[8px] text-[#B5B5B5]">
                            {loans.loans.filter((t_item) => t_item.nftAddress == item.nftAddress && t_item.amount != 0 && !t_item.accepted && !t_item.paid && !t_item.liquidated).length} of {loans.loans.filter((t_item) => t_item.nftAddress == item.nftAddress).length} offers taken
                          </span>
                        </td>
                        <td className="max-sm:text-[11px] pl-4 max-sm:px-4">
                          <span className="text-lg mr-1">Ŀ</span>{formatUnits(loans.loans.filter((t_item) => t_item.nftAddress == item.nftAddress && t_item.amount != 0 && !t_item.accepted && !t_item.paid && !t_item.liquidated).sort((a, b) => a.amount - b.amount).at(0).amount, 18)} <br />
                          <span className="text-[9px] max-sm:text-[8px] text-[#B5B5B5]">
                            Ŀ {formatUnits(loans.loans.filter((t_item) => t_item.nftAddress == item.nftAddress && t_item.amount != 0 && !t_item.accepted && !t_item.paid && !t_item.liquidated).at(loans.loans.filter((t_item) => t_item.nftAddress == item.nftAddress && t_item.amount != 0 && !t_item.accepted && !t_item.paid && !t_item.liquidated).length - 1).amount, 18)} last loan taken
                          </span>{" "}
                        </td>
                        <td className="max-sm:text-[11px] max-sm:px-4 pl-4">{item.interest / 10} %</td>
                        <td className="pl-4 max-sm:px-4 max-sm:text-[11px]">{(item.duration / 86400).toFixed(2)}d</td>
                        <td><button onClick={(e) => onAcceptOffer(index)} className="bg-gradient-to-r from-[#159F2C] text-black px-6 py-2 max-sm:px-4 max-sm:py-2 rounded-lg to-[#DBFF00] max-sm:text-[10px]">BORROW</button></td>
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
      {selectedLend != -1 &&
        <div className={`font-superLagendBoy fixed top-0 left-0 w-[100vw] h-[100vh] flex justify-center items-center bg-[#00000030] backdrop-blur-md p-[20px] z-10`}>
          <div
            className="fixed inset-0 transition-opacity"
            onClick={() => { if (!acceptPending && !approvePending) setSelectedLend(-1) }}
          />
          <div className="min-w-[300px] max-w-[400px] bg-[#D9D9D930] backdrop-blur-sm flex gap-[20px] flex-col rounded-[10px] p-[20px]" >
            <div className="w-full flex gap-[20px] justify-between items-center">
              <img className="w-[65px] h-[65px] object-contain rounded-full" src={collections.find((collection) => collection.address == loans.loans[selectedLend].nftAddress).avatar} alt="avatar" />
              <span className="text-[14px] font-[400] text-white">{collections.find((collection) => collection.address == loans.loans[selectedLend].nftAddress).name}</span>
              <div className="flex flex-col items-center bg-[#D9D9D930] border border-[#DBFF0030] rounded-[10px] px-[20px] py-[5px]">
                <span className="text-[10px] font-[400] text-white">FLOOR</span>
                <span className="text-[14px] font-[400] text-white">Ŀ {loans.loans.filter((loan) => loan.nftAddress == loans.loans[selectedLend].nftAddress && loan.amount != 0 && !loan.accepted && !loan.paid && !loan.liquidated).length == 0 ? 0 : formatUnits(loans.loans.filter((loan) => loan.nftAddress == loans.loans[selectedLend].nftAddress && loan.amount != 0 && !loan.accepted && !loan.paid && !loan.liquidated).sort((a, b) => a.amount - b.amount).at(0).amount, 18)}</span>
              </div>
            </div>
            <div className="w-full flex gap-[20px] justify-between">
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-[400] text-white">INTEREST</span>
                <span className="text-[14px] font-[400] text-[#DBFF00]">Ŀ {formatUnits(loans.loans[selectedLend].amount * (collections.find((collection) => collection.address == loans.loans[selectedLend].nftAddress).interest) / 1000, 18)}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-[400] text-white">DURATION</span>
                <span className="text-[14px] font-[400] text-white">{(loans.loans[selectedLend].duration / 86400).toFixed(2)}d</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-[400] text-white">Available to Borrow</span>
                <span className="text-[14px] font-[400] text-white">Ŀ {formatUnits(loans.loans[selectedLend].amount, 18)}</span>
              </div>
            </div>
            <div className="w-full h-[200px] flex flex-wrap gap-[20px] justify-center items-center overflow-y-auto p-[10px]">
              {tokenIds.map((tokenId) => {
                return (
                  <div onClick={(e) => { onSelectToken(tokenId) }} className={`h-[180px] w-[130px] flex flex-col gap-[5px] items-center bg-[#D9D9D930] border ${Number(selectedTokenId) == Number(tokenId) ? "border-[#DBFF00]" : "border-[#DBFF0030]"}  rounded-[10px] p-[5px] cursor-pointer`}>
                    <img className="flex-1 w-full object-cover object-center" src={defaultBanner} alt="" />
                    <span className="text-[10px] text-white">{collections.find((collection) => collection.address == loans.loans[selectedLend].nftAddress).name}</span>
                    <span className="text-[10px] text-white">#{Number(tokenId)}</span>
                  </div>
                )
              })}
            </div>
            <div className="w-full flex justify-center">
              <span className="text-[20px] font-[400] text-white">Ŀ {formatUnits(loans.loans[selectedLend].amount, 18)}</span>
            </div>
            <div className="w-full flex justify-center">
              {isApproved ? <button disabled={acceptPending} onClick={(e) => { acceptOffer() }} className="bg-gradient-to-r from-[#159F2C] text-black px-6 py-2 max-sm:text-[11px] max-sm:px-4 rounded-lg to-[#DBFF00]">
                BORROW {formatUnits(loans.loans[selectedLend].amount, 18)} {acceptPending ? <FontAwesomeIcon icon={faSpinner} size="sm" className="animate-spin" /> : <></>}</button> :
                <button disabled={approvePending} onClick={(e) => { authorizeLSP8() }} className="bg-gradient-to-r from-[#159F2C] text-black px-6 py-2 max-sm:text-[11px] max-sm:px-4 rounded-lg to-[#DBFF00]">
                  APPROVE {approvePending ? <FontAwesomeIcon icon={faSpinner} size="sm" className="animate-spin" /> : <></>}</button>
              }
            </div>
          </div>
        </div>
      }
    </>
  )
}

export default Borrow