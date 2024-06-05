import { useEffect, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { QRCodeSVG } from "qrcode.react";
import CopyToClipboard from "react-copy-to-clipboard";
import { useAccount, useDisconnect, useSwitchNetwork } from "wagmi";
import {
  ArrowLeftOnRectangleIcon,
  ArrowTopRightOnSquareIcon,
  ArrowsRightLeftIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  DocumentDuplicateIcon,
  QrCodeIcon,
} from "@heroicons/react/24/outline";
import { Address, Balance, BlockieAvatar } from "../../components/wandz-eth";
import { useAutoConnect, useNetworkColor } from "../../hooks/wandz-eth";
import { getBlockExplorerAddressLink, getTargetNetwork } from "../../utils/wandz-eth/network";

import { ERC725 } from '@erc725/erc725.js';
import lsp3ProfileSchema from '@erc725/erc725.js/schemas/LSP3ProfileMetadata.json';

/**
 * Custom Wagmi Connect Button (watch balance + custom design)
 */
export const RainbowKitCustomConnectButton = () => {
  useAutoConnect();
  const networkColor = useNetworkColor();
  const configuredNetwork = getTargetNetwork();
  const { disconnect } = useDisconnect();
  const account = useAccount();
  const { switchNetwork } = useSwitchNetwork();
  const [addressCopied, setAddressCopied] = useState(false);

  const [profileInfo, setProfileInfo] = useState();
  const [profileImage, setProfileImage] = useState("");

  const fetchProfileMetadata = async () => {

    try {
      const erc725js = new ERC725(lsp3ProfileSchema, account.address, 'https://37278372983976287937sigma9302.enterprise.rpc.lukso.sigmacore.io',
        {
          ipfsGateway: 'https://api.universalprofile.cloud/ipfs',
        },
      );

      const profileMetaData = await erc725js.fetchData('LSP3Profile');
      console.log(profileMetaData);

      for(let i = 0; i < profileMetaData.value.LSP3Profile.profileImage.length; i++) {
        const image = new Image();
        const url = profileMetaData.value.LSP3Profile.profileImage[i].url.replace("ipfs://", "https://api.universalprofile.cloud/ipfs/");
        image.src = url;
        image.onload = () => {
          setProfileImage(url);
        }
      }

      setProfileInfo({
        name: profileMetaData.value.LSP3Profile.name,
        avatar: profileMetaData.value.LSP3Profile.profileImage
      })

    } catch (error) {
      setProfileInfo();
      console.log(error);
    }
  }

  useEffect(() => {
    if (account.address) {
      fetchProfileMetadata();
    }
  }, [account.address])

  return (
    <ConnectButton.Custom>
      {({ account, chain, openConnectModal, mounted }) => {
        const connected = mounted && account && chain;
        const blockExplorerAddressLink = account
          ? getBlockExplorerAddressLink(getTargetNetwork(), account.address)
          : undefined;

        return (
          <>
            {(() => {
              if (!connected) {
                return (
                  <button className="relative button-style bg-gradient-to-t from-[#c6e3076e] to-[#ddff0000] border border-[#DBFF00] px-4 py-2 bor"
                    style={{ position: "relative", overflow: "hidden" }} onClick={openConnectModal} type="button">
                    Select Profile
                  </button>
                );
              }

              if (chain.unsupported || chain.id !== configuredNetwork.id) {
                return (
                  <button onClick={() => switchNetwork?.(configuredNetwork.id)} className="relative button-style bg-gradient-to-t from-[#c6e3076e] to-[#ddff0000] border border-[#DBFF00] px-4 py-2 bor hs-dropdown-toggle"
                    style={{ position: "relative", overflow: "hidden" }}>
                    <span className="whitespace-nowrap">
                      SWITCH TO <span style={{ color: networkColor }}>{configuredNetwork.name}</span>
                    </span>
                  </button>
                );
              }

              return (
                <div className="px-2 flex justify-end items-center">
                  {/* <div className="flex flex-col items-center mr-1">
                    <a
                      target="_blank"
                      href={blockExplorerAddressLink}
                      rel="noopener noreferrer"
                      className="whitespace-nowrap"
                    >
                      <Balance address={account.address} className="min-h-0 h-auto" />
                    </a>
                    <span className="text-xs" style={{ color: networkColor }}>
                      {chain.name}
                    </span>
                  </div> */}
                  <button
                    className="relative flex items-center button-style bg-gradient-to-t from-[#c6e3076e] to-[#ddff0000] border border-[#DBFF00] px-4 py-2"
                    style={{ position: "relative", overflow: "hidden" }}
                    onClick={() => disconnect()}
                  >
                    <BlockieAvatar address={account.address} size={30} ensImage={profileImage ? profileImage : account.ensAvatar} />
                    <span className="ml-2 mr-1">{profileInfo ? profileInfo.name : account.displayName}</span>
                  </button>
                  {/* <CopyToClipboard
                    text={account.address}
                    onCopy={() => {
                      setAddressCopied(true);
                      setTimeout(() => {
                        setAddressCopied(false);
                      }, 800);
                    }}
                  >
                    <DocumentDuplicateIcon
                      className="text-xl font-normal h-6 w-4 cursor-pointer ml-2 sm:ml-0"
                      aria-hidden="true"
                    />
                  </CopyToClipboard> */}
                </div>
              );
            })()}
          </>
        );
      }}
    </ConnectButton.Custom>
  );
};
