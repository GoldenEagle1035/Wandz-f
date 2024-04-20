import * as chains from "viem/chains";
import wandzConfig from "../../wandz.config";

export const NETWORKS_EXTRA_DATA = {
    [chains.hardhat.id]: {
        color: "#b8af0c",
    },
    [chains.mainnet.id]: {
        color: "#ff8b9e",
    },
    [chains.sepolia.id]: {
        color: ["#5f4bb6", "#87ff65"],
    },
    [chains.goerli.id]: {
        color: "#0975F6",
    },
    [chains.gnosis.id]: {
        color: "#48a9a6",
    },
    [chains.polygon.id]: {
        color: "#2bbdf7",
        nativeCurrencyTokenAddress: "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0",
    },
    [chains.polygonMumbai.id]: {
        color: "#92D9FA",
        nativeCurrencyTokenAddress: "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0",
    },
    [chains.optimismGoerli.id]: {
        color: "#f01a37",
    },
    [chains.optimism.id]: {
        color: "#f01a37",
    },
    [chains.arbitrumGoerli.id]: {
        color: "#28a0f0",
    },
    [chains.arbitrum.id]: {
        color: "#28a0f0",
    },
    [chains.fantom.id]: {
        color: "#1969ff",
    },
    [chains.fantomTestnet.id]: {
        color: "#1969ff",
    },
    [chains.scrollSepolia.id]: {
        color: "#fbebd4",
    },
    [42]: { // LUKSO
        color: "#fe005b",
    },
    [4201]: { // LUKSO Testnet
        color: "#fe005b",
    },
};

/**
 * Gives the block explorer transaction URL.
 * @param network
 * @param txnHash
 * @dev returns empty string if the network is localChain
 */
export function getBlockExplorerTxLink(chainId, txnHash) {
    const chainNames = Object.keys(chains);

    const targetChainArr = chainNames.filter(chainName => {
        const wagmiChain = chains[chainName];
        return wagmiChain.id === chainId;
    });

    if (targetChainArr.length === 0) {
        return "";
    }

    const targetChain = targetChainArr[0];
    // @ts-expect-error : ignoring error since `blockExplorers` key may or may not be present on some chains
    const blockExplorerTxURL = chains[targetChain]?.blockExplorers?.default?.url;

    if (!blockExplorerTxURL) {
        return "";
    }

    return `${blockExplorerTxURL}/tx/${txnHash}`;
}

/**
 * Gives the block explorer Address URL.
 * @param network - wagmi chain object
 * @param address
 * @returns block explorer address URL and etherscan URL if block explorer URL is not present for wagmi network
 */
export function getBlockExplorerAddressLink(network, address) {
    const blockExplorerBaseURL = network.blockExplorers?.default?.url;
    if (network.id === chains.hardhat.id) {
        return `/blockexplorer/address/${address}`;
    }

    if (!blockExplorerBaseURL) {
        return `https://etherscan.io/address/${address}`;
    }

    return `${blockExplorerBaseURL}/address/${address}`;
}

export function getTargetNetwork() {
    const configuredNetwork = wandzConfig.targetNetwork;

    return {
        ...configuredNetwork,
        ...NETWORKS_EXTRA_DATA[configuredNetwork.id],
    };
}
