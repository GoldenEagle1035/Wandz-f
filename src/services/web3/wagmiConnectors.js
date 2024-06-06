import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import { metaMaskWallet } from "@rainbow-me/rainbowkit/wallets";
import wandzConfig from "../../wandz.config";
import { luksoUpWallet } from "./luksoUpWallet/luksoUpWallet";
import { getTargetNetwork } from "../../utils/wandz-eth/network";

export const configuredNetwork = getTargetNetwork();

const wallets = window.lukso ? [metaMaskWallet] :
  [
    luksoUpWallet,
    metaMaskWallet,
  ];

export const wagmiConnectors = connectorsForWallets(
  [
    {
      groupName: "Supported Wallets",
      wallets,
    },
  ],
  {
    appname: 'Wandz',
    projectId: wandzConfig.walletConnectProjectId
  }
);
