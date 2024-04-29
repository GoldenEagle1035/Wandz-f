import { useEffect, useState } from "react";

import { useAccount, useContractRead, useContractWrite } from 'wagmi';
import { readContracts } from '@wagmi/core'

import lendAbi from "../../lukso/abis/lend_abi.json";

const lendAddress = '0xa08a897A86Fc50C7b37719c0088C69Cb85ac7A16';
const adminAddress = '0xa842a38CD758f8dE8537C5CBcB2006DB0250eC7C';

export const useLoans = () => {

    const [refetch, setRefetch] = useState(false);

    const [loans, setLoans] = useState([]);

    const { data: loanIdCounter } = useContractRead({
        address: lendAddress,
        abi: lendAbi,
        functionName: 'loanIdCounter',
        args: [
        ],
    })

    const { writeAsync: extendLoan } = useContractWrite({
        address: lendAddress,
        abi: lendAbi,
        functionName: 'extendLoan',
    })
    
    const { writeAsync: liquidateLoan } = useContractWrite({
        address: lendAddress,
        abi: lendAbi,
        functionName: 'liquidateLoan',
    })

    const { writeAsync: repayLoan } = useContractWrite({
        address: lendAddress,
        abi: lendAbi,
        functionName: 'repayLoan',
    })

    const { writeAsync: acceptLoan } = useContractWrite({
        address: lendAddress,
        abi: lendAbi,
        functionName: 'acceptLoan',
    })

    const { writeAsync: revokeLoan } = useContractWrite({
        address: lendAddress,
        abi: lendAbi,
        functionName: 'revokeLoan',
    })

    const { writeAsync: offerLoan } = useContractWrite({
        address: lendAddress,
        abi: lendAbi,
        functionName: 'offerLoan',
    })

    const fetchLoans = async () => {
        let tmpLoans = [];
        let contracts = [];
        for (let i = 0; i < loanIdCounter; i++) {
            contracts.push({
                address: lendAddress,
                abi: lendAbi,
                functionName: 'loans',
                args: [i]
            });
        }
        const data = await readContracts({ contracts });
        data.map((item) => {
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
                    liquidated: item.result[11]
                });
            }
        })
        setLoans(tmpLoans);

        console.log(tmpLoans);
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

    return { lendAddress, adminAddress, loans, loanIdCounter, offerLoan, revokeLoan, acceptLoan, repayLoan, liquidateLoan, extendLoan };
};
