import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import { coinbaseWallet, metaMaskWallet } from "@rainbow-me/rainbowkit/wallets";
import * as chains from "viem/chains";
import { configureChains } from "wagmi";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import wandzConfig from "../../wandz.config";
import { luksoUpWallet } from "./luksoUpWallet/luksoUpWallet";
import { getTargetNetwork } from "../../utils/wandz-eth/network";

const configuredNetwork = getTargetNetwork();

// We always want to have mainnet enabled (ENS resolution, ETH price, etc). But only once.
const enabledChains = configuredNetwork.id === 1 ? [configuredNetwork] : [configuredNetwork, chains.mainnet];
/**
 * Chains for the app
 */
export const appChains = configureChains(
  enabledChains,
  [
    alchemyProvider({
      apiKey: wandzConfig.alchemyApiKey,
    }),
    publicProvider(),
  ],
  {
    // We might not need this checkout https://github.com/scaffold-eth/scaffold-eth-2/pull/45#discussion_r1024496359, will test and remove this before merging
    stallTimeout: 3_000,
    // Sets pollingInterval if using chain's other than local hardhat chain
    ...(configuredNetwork.id !== chains.hardhat.id
      ? {
          pollingInterval: wandzConfig.pollingInterval,
        }
      : {}),
  },
);

const walletsOptions = { chains: appChains.chains, projectId: wandzConfig.walletConnectProjectId };
const wallets = [
  luksoUpWallet({ ...walletsOptions, shimDisconnect: true }),
  metaMaskWallet({ ...walletsOptions, shimDisconnect: true }),
  // coinbaseWallet({ ...walletsOptions, appName: "wandz" }),
];

/**
 * wagmi connectors for the wagmi context
 */
export const wagmiConnectors = connectorsForWallets([
  {
    groupName: "Supported Wallets",
    wallets,
  },
]);
