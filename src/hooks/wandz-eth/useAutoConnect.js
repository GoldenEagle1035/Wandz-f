import { useEffect, useState } from "react";
import { hardhat } from "viem/chains";
import { useAccount, useConnect } from "wagmi";
import wandzConfig from "../../wandz.config";
import { getTargetNetwork } from "../../utils/wandz-eth/network";

const WANDZ_WALLET_STROAGE_KEY = "wandz.wallet";
const WAGMI_WALLET_STORAGE_KEY = "wagmi.wallet";

// ID of the SAFE connector instance
const SAFE_ID = "safe";

/**
 * This function will get the initial wallet connector (if any), the app will connect to
 * @param previousWalletId
 * @param connectors
 * @returns
 */
const getInitialConnector = (
  previousWalletId,
  connectors,
) => {
  // Look for the SAFE connector instance and connect to it instantly if loaded in SAFE frame
  const safeConnectorInstance = connectors.find(connector => connector.id === SAFE_ID && connector.ready);

  if (safeConnectorInstance) {
    return { connector: safeConnectorInstance };
  }

  const targetNetwork = getTargetNetwork();

  if (!previousWalletId) {
    // The user was not connected to a wallet
  } else {
    // the user was connected to wallet
    if (wandzConfig.walletAutoConnect) {
      const connector = connectors.find(f => f.id === previousWalletId);
      return { connector };
    }
  }

  return undefined;
};

/**
 * Automatically connect to a wallet/connector based on config and prior wallet
 */
export const useAutoConnect = () => {

  const [walletId, setWalletId] = useState();

  const connectState = useConnect();
  const accountState = useAccount();

  useEffect(() => {
    if (accountState.isConnected) {
      // user is connected, set walletName
      setWalletId(accountState.connector?.id ?? "");
      localStorage.setItem(WANDZ_WALLET_STROAGE_KEY, accountState.connector?.id);
    } else {
      // user has disconnected, reset walletName
      localStorage.setItem(WAGMI_WALLET_STORAGE_KEY, JSON.stringify(""));
      setWalletId("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountState.isConnected, accountState.connector?.name]);

  useEffect(() => {
    const wagmiWalletValue = localStorage.getItem(WAGMI_WALLET_STORAGE_KEY);
    const wandzWalletValue = localStorage.getItem(WANDZ_WALLET_STROAGE_KEY);
    let walletId;

    if (wandzWalletValue) {
      walletId = wandzWalletValue;
    } else {
      walletId = wagmiWalletValue ?? "";
    }
    setWalletId(walletId);

    const initialConnector = getInitialConnector(walletId, connectState.connectors);

    if (initialConnector?.connector) {
      connectState.connect({ connector: initialConnector.connector, chainId: initialConnector.chainId });
    }
  });
};
