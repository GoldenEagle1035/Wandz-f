import React, { useEffect, useState, useContext } from "react";
import VideoBG from "../global/VideoBG";
import Nav from "../global/Nav";
import { FiSearch, FiFilter } from "react-icons/fi";
import Filter from "../../assets/icons/Filter.png";
import { tableData } from "../data/data";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import defaultBanner from "../../assets/banners/default.webp";

// import { collections } from "../../data/collections";

import { useAccount } from 'wagmi';
import { readContract, writeContract } from '@wagmi/core'
import { parseEther, formatUnits } from 'viem';

import { LoansContext } from "../../context/loan-context";
import { CollectionsContext } from "../../context/collection-context";

import lsp8Abi from '../../lukso/abis/lsp8_abi.json';

import { ERC725 } from '@erc725/erc725.js';
import lsp4Schema from '@erc725/erc725.js/schemas/LSP4DigitalAsset.json';
import lsp8Schema from '@erc725/erc725.js/schemas/LSP8IdentifiableDigitalAsset.json';
import { INTERFACE_IDS, ERC725YDataKeys } from '@lukso/lsp-smart-contracts';
import { wagmiConfig } from "../../services/web3/wagmiConfig";

import axios from 'axios';

function Borrow() {

  const [selectedCollection, setSelectedCollection] = useState(-1);
  const [selectedLend, setSelectedLend] = useState(-1);
  const [selectedTokenId, setSelectedTokenId] = useState('-1');
  const [tokenIds, setTokenIds] = useState([]);
  const [isApproved, setIsApproved] = useState(false);
  const [acceptPending, setAcceptPending] = useState(false);
  const [approvePending, setApprovePending] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const [tokenImages, setTokenImages] = useState([]);
  const [isLoadingTokens, setIsLoadingTokens] = useState(false);

  const [searchValue, setSearchValue] = useState('');
  const [showMore, setShowMore] = useState(false);

  const account = useAccount();

  const loans = useContext(LoansContext);
  const { collections, isLoading: isLoadingCollection } = useContext(CollectionsContext);

  const onAcceptOffer = (lendIndex) => {
    setSelectedTokenId('-1');
    setTokenIds([]);
    setIsApproved(false);
    setSelectedLend(lendIndex);
    setConfirmed(false);
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
        await loans.waitForTransactionReceipt(wagmiConfig, { hash: result });
        
        setConfirmed(true);
      } catch (error) {
        console.log(error);
        setSelectedLend(-1);
      }
      setAcceptPending(false);
    }
  }

  const authorizeLSP8 = async () => {
    try {
      setApprovePending(true);
      const result = await writeContract(wagmiConfig, {
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
      const is_approved = await readContract(wagmiConfig, {
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

  const fetchTokenIdMetadata = async (nftAddress, tokenID) => {
    try {
      // Retrieve the global Base URI
      let tokenBaseURI = await readContract(wagmiConfig, {
        address: nftAddress,
        abi: lsp8Abi,
        functionName: 'getData',
        args: [ERC725YDataKeys.LSP8['LSP8TokenMetadataBaseURI']]
      });
      console.log(tokenID, Number(tokenID), tokenBaseURI)

      if (tokenBaseURI == '0x') {
        console.log('BaseURI not set.');
        return;
      }

      // if (Number(tokenID) >= 100) {
      //   tokenBaseURI = await readContract({
      //     address: nftAddress,
      //     abi: lsp8Abi,
      //     functionName: 'getData',
      //     args: [tokenID, ERC725YDataKeys.LSP8['LSP8TokenIdFormat']]
      //   });
      // }

      const erc725js = new ERC725(lsp8Schema);
      // Decode the baseURI
      const decodedBaseURI = erc725js.decodeData([
        {
          keyName: 'LSP8TokenMetadataBaseURI',
          value: tokenBaseURI,
        },
      ]);
      console.log(tokenID, decodedBaseURI)

      // Return Base URI
      const metadataUrl = decodedBaseURI[0].value.url.replace("ipfs://", "https://api.universalprofile.cloud/ipfs/") + Number(tokenID).toFixed(0);
      const data = await axios.get(metadataUrl);
      console.log(data);
      return data.data.LSP4Metadata.images.at(0).at(0).url.replace("ipfs://", "https://api.universalprofile.cloud/ipfs/");
    } catch (error) {
      console.log(error);
    }
  }

  // const fetchTokenIdMetadata = async (nftAddress, tokenID) => {
  //   try {
  //     // Get the encoded asset metadata
  //     const tokenIdMetadata = await readContract({
  //       address: nftAddress,
  //       abi: lsp8Abi,
  //       functionName: 'getDataForTokenId',
  //       args: [tokenID, ERC725YDataKeys.LSP4['LSP4Metadata']]
  //     });
  //     console.log(tokenID, tokenIdMetadata)
  //     const erc725js = new ERC725(lsp4Schema);

  //     // Decode the metadata
  //     const decodedMetadata = erc725js.decodeData([
  //       {
  //         keyName: 'LSP4Metadata',
  //         value: tokenIdMetadata,
  //       },
  //     ]);
  //     console.log(tokenID, decodedMetadata)
  //     const metadataUrl = decodedMetadata[0].value.url.replace("ipfs://", "https://api.universalprofile.cloud/ipfs/");
  //     const data = await axios.get(metadataUrl);
  //     console.log(data.data.LSP4Metadata);
  //     console.log(data.data.LSP4Metadata.images.at(0));
  //     console.log(data.data.LSP4Metadata.images.at(0).at(0).url);
  //     console.log(data.data.LSP4Metadata.images.at(0).at(0).url.replace("ipfs://", "https://api.universalprofile.cloud/ipfs/"));
  //     return data.data.LSP4Metadata.images.at(0).at(0).url.replace("ipfs://", "https://api.universalprofile.cloud/ipfs/");
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }

  const fetchTokenIds = async () => {
    if (account.address) {
      setIsLoadingTokens(true);
      try {
        const tokenIds = await readContract(wagmiConfig, {
          address: loans.loans[selectedLend].nftAddress,
          abi: lsp8Abi,
          functionName: 'tokenIdsOf',
          args: [account.address]
        });

        let tempUrls = [];
        for (let i = 0; i < tokenIds.length; i++) {
          const imgUrl = await fetchTokenIdMetadata(loans.loans[selectedLend].nftAddress, tokenIds[i]);
          tempUrls.push(imgUrl);
        }
        setTokenImages(tempUrls);
        setTokenIds(tokenIds);
      } catch (error) {
        console.log(error);
      }
      setIsLoadingTokens(false);
    }
  }

  useEffect(() => {
    if (selectedLend != -1 && account.address.toLowerCase() != loans.loans[selectedLend].lender.toLowerCase()) {
      fetchTokenIds();
    }
  }, [selectedLend, account.address])

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
              <p className="max-sm:hidden font-superLagendBoy text-xl max-sm:text-lg text-[#FFFFFF]">
                Instantly take a loan against your NFTs. Escrow-free loans allows you to keep the collateral NFT in your wallet. When you accept a loan offer, a secure contract is created, freezing the NFT in-wallet. Not repaying by the due date means the lender can repossess your NFT. Successfully pay the loan in full by the expiration date to automatically thaw the NFT.
              </p>
              <div className="hidden max-sm:flex flex-col gap-[10px] items-center">
                {showMore ? <p className="font-superLagendBoy text-xl max-sm:text-lg text-[#FFFFFF]">
                  Instantly take a loan against your NFTs. Escrow-free loans allows you to keep the collateral NFT in your wallet. When you accept a loan offer, a secure contract is created, freezing the NFT in-wallet. Not repaying by the due date means the lender can repossess your NFT. Successfully pay the loan in full by the expiration date to automatically thaw the NFT.
                </p> : <>
                  <p className="font-superLagendBoy text-xl max-sm:text-lg text-[#FFFFFF]">
                    Instantly take a loan against your NFTs.
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
                {/* <div className="filters">
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
                    {collections.map((collection, index) => (
                      collection.name.toLowerCase().includes(searchValue.toLowerCase()) && loans.loans.filter((loan) => loan.nftAddress.toLowerCase() == collection.address.toLowerCase() && loan.duration == collection.duration && loan.amount != 0 && !loan.accepted && !loan.paid && !loan.liquidated).length != 0 &&
                      <tr className="py-10 border-b-[1px] border-[#a9a9a9d8] max-sm:px-4">
                        <td className="p-4 pl-4 flex gap-2 items-center max-sm:text-[11px] max-sm:px-4">
                          <span className="max-sm:w-6">
                            <img className="w-[40px] h-[40px] object-contain rounded-full" src={collection.avatar} alt="" />
                          </span>
                          {collection.name}
                        </td>
                        <td className=" max-sm:px-4 pl-4 max-sm:text-[11px]">
                          <span className="text-lg mr-1">Ŀ</span>{formatUnits(loans.loans.filter((loan) => loan.nftAddress.toLowerCase() == collection.address.toLowerCase() && loan.duration == collection.duration && loan.amount != 0 && !loan.accepted && !loan.paid && !loan.liquidated).reduce(((total, loan) => total + loan.amount), 0), 18)}
                          <br />
                          <span className="text-[9px] max-sm:text-[8px] text-[#B5B5B5]">
                            {loans.loans.filter((loan) => loan.nftAddress.toLowerCase() == collection.address.toLowerCase() && loan.duration == collection.duration && loan.amount != 0 && !loan.accepted && !loan.paid && !loan.liquidated).length} of {loans.loans.filter((loan) => loan.nftAddress.toLowerCase() == collection.address.toLowerCase() && loan.duration == collection.duration).length} offers taken
                          </span>
                        </td>
                        <td className="max-sm:text-[11px] pl-4 max-sm:px-4">
                          <span className="text-lg mr-1">Ŀ</span>{formatUnits(loans.loans.filter((loan) => loan.nftAddress.toLowerCase() == collection.address.toLowerCase() && loan.duration == collection.duration && loan.amount != 0 && !loan.accepted && !loan.paid && !loan.liquidated).length != 0 ? loans.loans.filter((loan) => loan.nftAddress.toLowerCase() == collection.address.toLowerCase() && loan.duration == collection.duration && loan.amount != 0 && !loan.accepted && !loan.paid && !loan.liquidated).sort((a, b) => a.amount - b.amount).at(0).amount : 0, 18)} <br />
                          <span className="text-[9px] max-sm:text-[8px] text-[#B5B5B5]">
                            Ŀ {formatUnits(loans.loans.filter((loan) => loan.nftAddress.toLowerCase() == collection.address.toLowerCase() && loan.duration == collection.duration && loan.amount != 0 && !loan.accepted && !loan.paid && !loan.liquidated).length != 0 ? loans.loans.filter((loan) => loan.nftAddress.toLowerCase() == collection.address.toLowerCase() && loan.duration == collection.duration && loan.amount != 0 && !loan.accepted && !loan.paid && !loan.liquidated).at(loans.loans.filter((loan) => loan.nftAddress.toLowerCase() == collection.address.toLowerCase() && loan.duration == collection.duration && loan.amount != 0 && !loan.accepted && !loan.paid && !loan.liquidated).length - 1).amount : 0, 18)} last loan taken
                          </span>{" "}
                        </td>
                        <td className="max-sm:text-[11px] max-sm:px-4 pl-4">{collection.interest / 10 - 100} %</td>
                        <td className="pl-4 max-sm:px-4 max-sm:text-[11px]">{(collection.duration / 86400).toFixed(2)}d</td>
                        <td><button disabled={!account.address} onClick={(e) => setSelectedCollection(index)} className="bg-gradient-to-r from-[#159F2C] text-black px-6 py-2 max-sm:px-4 max-sm:py-2 rounded-lg to-[#DBFF00] max-sm:text-[10px]">BORROW</button></td>
                      </tr>
                    ))}
                    {/* {loans.loans.map((loan, index) => (
                      loan.amount != 0 && !loan.accepted && !loan.paid && !loan.liquidated && collections.find((collection) => collection.address.toLowerCase() == loan.nftAddress.toLowerCase() && collection.duration == loan.duration) && collections.find((collection) => collection.address.toLowerCase() == loan.nftAddress.toLowerCase() && collection.duration == loan.duration).name.toLowerCase().includes(searchValue.toLowerCase()) &&
                      <tr className="py-10 border-b-[1px] border-[#a9a9a9d8] max-sm:px-4">
                        <td className="p-4 pl-4 flex gap-2 items-center max-sm:text-[11px] max-sm:px-4">
                          <span className="max-sm:w-6">
                            <img className="w-[40px] h-[40px] object-contain rounded-full" src={collections.find((collection) => collection.address.toLowerCase() == loan.nftAddress.toLowerCase() && collection.duration == loan.duration).avatar} alt="" />
                          </span>
                          {collections.find((collection) => collection.address.toLowerCase() == loan.nftAddress.toLowerCase() && collection.duration == loan.duration).name}
                        </td>
                        <td className=" max-sm:px-4 pl-4 max-sm:text-[11px]">
                          <span className="text-lg mr-1">Ŀ</span>{formatUnits(loans.loans.filter((t_item) => t_item.nftAddress.toLowerCase() == loan.nftAddress.toLowerCase() && t_item.duration == loan.duration && t_item.amount != 0 && !t_item.accepted && !t_item.paid && !t_item.liquidated).reduce(((total, tt_item) => total + tt_item.amount), 0), 18)}
                          <br />
                          <span className="text-[9px]  max-sm:text-[8px] text-[#B5B5B5]">
                            {loans.loans.filter((t_item) => t_item.nftAddress.toLowerCase() == loan.nftAddress.toLowerCase() && t_item.duration == loan.duration && t_item.amount != 0 && !t_item.accepted && !t_item.paid && !t_item.liquidated).length} of {loans.loans.filter((t_item) => t_item.nftAddress.toLowerCase() == loan.nftAddress.toLowerCase() && t_item.duration == loan.duration).length} offers taken
                          </span>
                        </td>
                        <td className="max-sm:text-[11px] pl-4 max-sm:px-4">
                          <span className="text-lg mr-1">Ŀ</span>{formatUnits(loans.loans.filter((t_item) => t_item.nftAddress.toLowerCase() == loan.nftAddress.toLowerCase() && t_item.duration == loan.duration && t_item.amount != 0 && !t_item.accepted && !t_item.paid && !t_item.liquidated).sort((a, b) => a.amount - b.amount).at(0).amount, 18)} <br />
                          <span className="text-[9px] max-sm:text-[8px] text-[#B5B5B5]">
                            Ŀ {formatUnits(loans.loans.filter((t_item) => t_item.nftAddress.toLowerCase() == loan.nftAddress.toLowerCase() && t_item.duration == loan.duration && t_item.amount != 0 && !t_item.accepted && !t_item.paid && !t_item.liquidated).at(loans.loans.filter((t_item) => t_item.nftAddress.toLowerCase() == loan.nftAddress.toLowerCase() && t_item.duration == loan.duration && t_item.amount != 0 && !t_item.accepted && !t_item.paid && !t_item.liquidated).length - 1).amount, 18)} last loan taken
                          </span>{" "}
                        </td>
                        <td className="max-sm:text-[11px] max-sm:px-4 pl-4">{loan.interest / 10 - 100} %</td>
                        <td className="pl-4 max-sm:px-4 max-sm:text-[11px]">{(loan.duration / 86400).toFixed(2)}d</td>
                        <td><button disabled={!account.address} onClick={(e) => onAcceptOffer(index)} className="bg-gradient-to-r from-[#159F2C] text-black px-6 py-2 max-sm:px-4 max-sm:py-2 rounded-lg to-[#DBFF00] max-sm:text-[10px]">BORROW</button></td>
                        <br />
                      </tr>
                    ))} */}
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
                    collection.name.toLowerCase().includes(searchValue.toLowerCase()) && loans.loans.filter((loan) => loan.nftAddress.toLowerCase() == collection.address.toLowerCase() && loan.duration == collection.duration && loan.amount != 0 && !loan.accepted && !loan.paid && !loan.liquidated).length != 0 &&
                    <div className="py-4 border-b-[1px] border-[#a9a9a9d8] flex flex-col gap-[5px]">
                      <div className="flex gap-[10px] justify-between items-center">
                        <div className="flex gap-[5px] items-center">
                          <img className="w-[40px] h-[40px] object-contain rounded-full" src={collection.avatar} alt="" />
                          <span className="text-[11px] text-white">{collection.name}</span>
                        </div>
                        <button disabled={!account.address} onClick={(e) => setSelectedCollection(index)} className="bg-gradient-to-r from-[#159F2C] text-black px-4 py-2 rounded-lg to-[#DBFF00] text-[10px]">BORROW</button>
                      </div>
                      <div className="flex gap-[5px] text-white text-[11px]">
                        <span className="w-1/4 text-center">Ŀ{formatUnits(loans.loans.filter((loan) => loan.nftAddress.toLowerCase() == collection.address.toLowerCase() && loan.duration == collection.duration && loan.amount != 0 && !loan.accepted && !loan.paid && !loan.liquidated).reduce(((total, loan) => total + loan.amount), 0), 18)}</span>
                        <span className="w-1/4 text-center">Ŀ{formatUnits(loans.loans.filter((loan) => loan.nftAddress.toLowerCase() == collection.address.toLowerCase() && loan.duration == collection.duration && loan.amount != 0 && !loan.accepted && !loan.paid && !loan.liquidated).length != 0 ? loans.loans.filter((loan) => loan.nftAddress.toLowerCase() == collection.address.toLowerCase() && loan.duration == collection.duration && loan.amount != 0 && !loan.accepted && !loan.paid && !loan.liquidated).sort((a, b) => a.amount - b.amount).at(0).amount : 0, 18)}</span>
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
      </div>
      {selectedCollection != -1 && selectedLend == -1 &&
        <div className={`font-superLagendBoy fixed top-0 left-0 w-[100vw] h-[100vh] flex justify-center items-center bg-[#00000030] backdrop-blur-md p-[20px] z-10`}>
          <div
            className="fixed inset-0 transition-opacity"
            onClick={() => { setSelectedCollection(-1) }}
          />
          <div className="min-w-[300px] max-w-[400px] bg-[#D9D9D930] backdrop-blur-sm flex gap-[20px] flex-col rounded-[10px] p-[10px]" >
            <img className="w-full h-[125px] object-center" src={collections[selectedCollection].banner} alt="banner" />
            <div className="w-full flex flex-col gap-[10px] items-center">
              <img className="w-[65px] h-[65px] object-contain rounded-full -mt-[53px]" src={collections[selectedCollection].avatar} alt="avatar" />
              <span className="text-[14px] font-[400] text-white">{collections[selectedCollection].name}</span>
            </div>
            <div className="w-full flex gap-[20px] justify-between">
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-[400] text-white">Pool</span>
                <span className="text-[14px] font-[400] text-[#DBFF00]">Ŀ{formatUnits(loans.loans.filter((loan) => loan.nftAddress.toLowerCase() == collections[selectedCollection].address.toLowerCase() && loan.duration == collections[selectedCollection].duration && loan.amount != 0 && !loan.accepted && !loan.paid && !loan.liquidated).reduce(((total, loan) => total + loan.amount), 0), 18)}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-[400] text-white">APY</span>
                <span className="text-[14px] font-[400] text-white">{collections[selectedCollection].interest / 10 - 100} %</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-[400] text-white">Duration</span>
                <span className="text-[14px] font-[400] text-white">{(collections[selectedCollection].duration / 86400).toFixed(2)}d</span>
              </div>
            </div>
            <div className="max-h-[50vh] overflow-y-auto w-full flex flex-col gap-[10px] px-[20px]">
              {loans.loans.map((loan, index) => (
                loan.amount != 0 && !loan.accepted && !loan.paid && !loan.liquidated && loan.nftAddress.toLowerCase() == collections[selectedCollection].address.toLowerCase() && loan.duration == collections[selectedCollection].duration &&
                <div onClick={(e) => onAcceptOffer(index)} className="flex gap-[10px] items-center cursor-pointer">
                  <div className="w-1/2 p-4 pl-4 flex gap-2 items-center max-sm:px-4 overflow-x-hidden">
                    <img className="w-[40px] h-[40px] object-contain rounded-full" src={collections[selectedCollection].avatar} alt="" />
                    <span className="max-sm:text-[11px] text-[14px] text-white">{collections[selectedCollection].name}</span>
                  </div>
                  <span className="w-1/2 p-4 pl-4 max-sm:text-[11px] text-[14px] text-center text-white max-sm:px-4">Ŀ{formatUnits(loan.amount, 18)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      }
      {selectedLend != -1 && !confirmed &&
        <div className={`font-superLagendBoy fixed top-0 left-0 w-[100vw] h-[100vh] flex justify-center items-center bg-[#00000030] backdrop-blur-md p-[20px] z-10`}>
          <div
            className="fixed inset-0 transition-opacity"
            onClick={() => { if (!acceptPending && !approvePending) setSelectedLend(-1) }}
          />
          <div className="min-w-[300px] max-w-[400px] bg-[#D9D9D930] backdrop-blur-sm flex gap-[20px] flex-col rounded-[10px] p-[20px]" >
            <div className="w-full flex gap-[20px] justify-between items-center">
              <img className="w-[65px] h-[65px] object-contain rounded-full" src={collections.find((collection) => collection.address.toLowerCase() == loans.loans[selectedLend].nftAddress.toLowerCase() && collection.duration == loans.loans[selectedLend].duration).avatar} alt="avatar" />
              <span className="text-[14px] font-[400] text-white">{collections.find((collection) => collection.address.toLowerCase() == loans.loans[selectedLend].nftAddress.toLowerCase() && collection.duration == loans.loans[selectedLend].duration).name}</span>
              <div className="flex flex-col items-center bg-[#D9D9D930] border border-[#DBFF0030] rounded-[10px] px-[20px] py-[5px]">
                <span className="text-[10px] font-[400] text-white">FLOOR</span>
                <span className="text-[14px] font-[400] text-white">Ŀ {loans.loans.filter((loan) => loan.nftAddress.toLowerCase() == loans.loans[selectedLend].nftAddress.toLowerCase() && loan.amount != 0 && !loan.accepted && !loan.paid && !loan.liquidated).length == 0 ? 0 : formatUnits(loans.loans.filter((loan) => loan.nftAddress.toLowerCase() == loans.loans[selectedLend].nftAddress.toLowerCase() && loan.amount != 0 && !loan.accepted && !loan.paid && !loan.liquidated).sort((a, b) => a.amount - b.amount).at(0).amount, 18)}</span>
              </div>
            </div>
            <div className="w-full flex gap-[20px] justify-between">
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-[400] text-white">INTEREST</span>
                <span className="text-[14px] font-[400] text-[#DBFF00]">Ŀ {Number(formatUnits(loans.loans[selectedLend].amount * (collections.find((collection) => collection.address.toLowerCase() == loans.loans[selectedLend].nftAddress.toLowerCase() && collection.duration == loans.loans[selectedLend].duration).interest) / 1000, 18)).toFixed(2)}</span>
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
            {account.address.toLowerCase() != loans.loans[selectedLend].lender.toLowerCase() ?
              <>
                {isLoadingTokens &&
                  <div className="flex gap-[20px] justify-center items-center text-white">
                    <FontAwesomeIcon icon={faSpinner} size="md" className="animate-spin" />
                    <span>Loading</span>
                  </div>}
                {!isLoadingTokens && (tokenIds.length != 0 ?
                  <>
                    <div className="w-full h-[200px] flex flex-wrap gap-[20px] justify-center items-center overflow-y-auto p-[10px]">
                      {tokenIds.map((tokenId, index) => {
                        return (
                          <div onClick={(e) => { onSelectToken(tokenId) }} className={`h-[180px] w-[130px] flex flex-col gap-[5px] items-center bg-[#D9D9D930] border ${Number(selectedTokenId) == Number(tokenId) ? "border-[#DBFF00]" : "border-[#DBFF0030]"}  rounded-[10px] p-[5px] cursor-pointer`}>
                            {tokenImages[index] ?
                              <img className="flex-1 w-full object-cover object-center" src={tokenImages[index]} alt="" /> :
                              <img className="flex-1 w-full object-cover object-center" src={defaultBanner} alt="" />
                            }
                            <span className="text-[10px] text-white">{collections.find((collection) => collection.address.toLowerCase() == loans.loans[selectedLend].nftAddress.toLowerCase() && collection.duration == loans.loans[selectedLend].duration).name}</span>
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
                  </> :
                  <>
                    <div className="w-full flex justify-center">
                      <span className="text-[20px] font-[400] text-[#f00] text-center">You don't own an NFT from this collection :)</span>
                    </div>
                    <div className="w-full flex justify-center">
                      <button onClick={(e) => { setSelectedLend(-1) }} className="bg-gradient-to-r from-[#159F2C] text-black px-6 py-2 max-sm:text-[11px] max-sm:px-4 rounded-lg to-[#DBFF00]">OK</button>
                    </div>
                  </>)
                }
              </> :
              <>
                <div className="w-full flex justify-center">
                  <span className="text-[20px] font-[400] text-[#f00] text-center">Can't borrow from your own offer :)</span>
                </div>
                <div className="w-full flex justify-center">
                  <button onClick={(e) => { setSelectedLend(-1) }} className="bg-gradient-to-r from-[#159F2C] text-black px-6 py-2 max-sm:text-[11px] max-sm:px-4 rounded-lg to-[#DBFF00]">OK</button>
                </div>
              </>
            }
          </div>
        </div >
      }
      {selectedLend != -1 && confirmed &&
        <div className={`font-superLagendBoy fixed top-0 left-0 w-[100vw] h-[100vh] flex justify-center items-center bg-[#00000030] backdrop-blur-md p-[20px] z-10`}>
          <div
            className="fixed inset-0 transition-opacity"
            onClick={() => { setSelectedLend(-1) }}
          />
          <div className="min-w-[300px] max-w-[400px] bg-[#D9D9D930] backdrop-blur-sm flex gap-[20px] flex-col rounded-[10px] p-[20px]" >
            <div className="w-full flex gap-[20px] justify-between items-center">
              <div className="w-[65px] h-[65px] flex justify-center items-center rounded-full border-[0.25px] border-[#DBFF00] bg-[#000]">
                <svg width="37" height="28" viewBox="0 0 37 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 17.25L10.5212 27L36 1" stroke="#DBFF00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </div>
              <div className="flex flex-col gap-[5px]">
                <span className="text-[14px] font-[400] text-white">You have Successfully</span>
                <div className="flex gap-[10px] items-center">
                  <span className="text-[14px] font-[400] text-white">Borrowed</span>
                  <span className="text-[14px] font-[400] text-[#DBFF00]">Ŀ {formatUnits(loans.loans[selectedLend].amount, 18)}</span>
                </div>
              </div>
            </div>
            <div className="w-full flex gap-[20px] justify-between">
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-[400] text-white">INTEREST</span>
                <span className="text-[14px] font-[400] text-[#DBFF00]">Ŀ {Number(formatUnits(loans.loans[selectedLend].amount * (collections.find((collection) => collection.address.toLowerCase() == loans.loans[selectedLend].nftAddress.toLowerCase() && collection.duration == loans.loans[selectedLend].duration).interest) / 1000, 18)).toFixed(2)}</span>
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
              {tokenIds.map((tokenId, index) => {
                if (Number(selectedTokenId) == Number(tokenId)) {
                  return (
                    <div onClick={(e) => { onSelectToken(tokenId) }} className={`h-[180px] w-[130px] flex flex-col gap-[5px] items-center bg-[#D9D9D930] border border-[#DBFF0030] rounded-[10px] p-[5px] cursor-pointer`}>
                      {tokenImages[index] ?
                        <img className="flex-1 w-full object-cover object-center" src={tokenImages[index]} alt="" /> :
                        <img className="flex-1 w-full object-cover object-center" src={defaultBanner} alt="" />
                      }
                      <span className="text-[10px] text-white">{collections.find((collection) => collection.address.toLowerCase() == loans.loans[selectedLend].nftAddress.toLowerCase() && collection.duration == loans.loans[selectedLend].duration).name}</span>
                      <span className="text-[10px] text-white">#{Number(tokenId)}</span>
                    </div>
                  )
                }
              })}
            </div>
            <div className="w-full flex justify-center">
              <button onClick={(e) => { setSelectedLend(-1) }} className="bg-gradient-to-r from-[#159F2C] text-black px-6 py-2 max-sm:text-[11px] max-sm:px-4 rounded-lg to-[#DBFF00]">OK</button>
            </div>
          </div>
        </div >
      }
    </>
  )
}

export default Borrow