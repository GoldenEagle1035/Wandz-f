import React, { createContext, useEffect, useState, useContext } from "react";

import { useAccount, useReadContract } from 'wagmi';
import { readContracts, writeContract, waitForTransactionReceipt } from '@wagmi/core'

import lendAbi from "../lukso/abis/lend_abi.json";
import { wagmiConfig } from "../services/web3/wagmiConfig";
// const lendAddress = '0xa08a897A86Fc50C7b37719c0088C69Cb85ac7A16'; //testnet
// const lendAddress = '0x2fc0437A1B4D470D745c6896354EA88c48961fF2'; //mainnet v1
const lendAddress = '0x2139c52Ae897F29689C73634Cf438e9C3BcC5e6E';
const adminAddress = '0xa842a38CD758f8dE8537C5CBcB2006DB0250eC7C';

function useLoansContext() {
    const [refetch, setRefetch] = useState(false);

    const [loans, setLoans] = useState([]);

    const { data: loanIdCounter } = useReadContract({
        address: lendAddress,
        abi: lendAbi,
        functionName: 'loanIdCounter',
        args: [],
    })

    const extendLoan = async (param) => {
        return await writeContract(wagmiConfig, {
            address: lendAddress,
            abi: lendAbi,
            functionName: 'extendLoan',
            ...param
        })
    }

    const liquidateLoan = async (param) => {
        return await writeContract(wagmiConfig, {
            address: lendAddress,
            abi: lendAbi,
            functionName: 'liquidateLoan',
            ...param
        })
    }

    const repayLoan = async (param) => {
        return await writeContract(wagmiConfig, {
            address: lendAddress,
            abi: lendAbi,
            functionName: 'repayLoan',
            ...param
        })
    }

    const acceptLoan = async (param) => {
        return await writeContract(wagmiConfig, {
            address: lendAddress,
            abi: lendAbi,
            functionName: 'acceptLoan',
            ...param
        })
    }

    const revokeLoan = async (param) => {
        return await writeContract(wagmiConfig, {
            address: lendAddress,
            abi: lendAbi,
            functionName: 'revokeLoan',
            ...param
        })
    }

    const offerLoan = async (param) => {
        return await writeContract(wagmiConfig, {
            address: lendAddress,
            abi: lendAbi,
            functionName: 'offerLoan',
            ...param
        })
    }
    
    const fetchLoans = async () => {

        console.log("fetch Loans ...", loanIdCounter);

        let tmpExtendsInfo = [];
        let contracts = [];
        for (let i = 0; i < loanIdCounter; i++) {
            contracts.push({
                address: lendAddress,
                abi: lendAbi,
                functionName: 'loanExtends',
                args: [i]
            });
        }
        let data = await readContracts(wagmiConfig, { contracts });
        data.map((item) => {
            if (item.status == 'success') {
                tmpExtendsInfo.push(item.result);
            }
        })

        let tmpLoans = [];
        contracts = [];
        for (let i = 0; i < loanIdCounter; i++) {
            contracts.push({
                address: lendAddress,
                abi: lendAbi,
                functionName: 'loans',
                args: [i]
            });
        }
        data = await readContracts(wagmiConfig, { contracts });
        data.map((item, index) => {
            if (item.status == 'success') {
                tmpLoans.push({
                    nftAddress: item.result[0],
                    lender: item.result[1],
                    borrower: item.result[2],
                    loanId: Number(item.result[3]),
                    duration: Number(item.result[4]),
                    amount: Number(item.result[5]),
                    interest: Number(item.result[6]),                    
                    durationCounter: Number(item.result[7]),
                    tokenId: item.result[8],
                    accepted: item.result[9],
                    paid: item.result[10],
                    liquidated: item.result[11],
                    extends: tmpExtendsInfo[index]
                });
            }
        })
        console.log(tmpLoans);
        setLoans(tmpLoans);
    }

    useEffect(() => {
        const timerID = setInterval(() => {
            setRefetch((prevData) => {
                return !prevData;
            })
        }, 10000);

        return () => {
            clearInterval(timerID);
        };
    }, []);

    useEffect(() => {
        if (loanIdCounter) {
            fetchLoans();
        }
    }, [loanIdCounter, refetch])

    return { lendAddress, adminAddress, loans, loanIdCounter, offerLoan, revokeLoan, acceptLoan, repayLoan, liquidateLoan, extendLoan, waitForTransactionReceipt };
}
export const LoansContext = createContext();

export const LoansProvider = (props) => {
    const loansContext = useLoansContext();

    return (
        <div>
            <LoansContext.Provider value={{ ...loansContext }}>
                {props.children}
            </LoansContext.Provider>
        </div>
    );
};