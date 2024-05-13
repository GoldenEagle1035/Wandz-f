import React, { createContext, useEffect, useState, useContext } from "react";

import { ERC725 } from '@erc725/erc725.js';
import lsp4Schema from '@erc725/erc725.js/schemas/LSP4DigitalAsset.json';

import { collection_preinfo } from '../data/collections';

import default_avatar from "../assets/icons/default.webp";
import default_banner from "../assets/banners/default.webp";

function useCollectionsContext() {
    const [collections, setCollections] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchMetadata = async () => {

        console.log("fetch LSP8 Metadata ...", isLoading, collections);

        setIsLoading(true);

        const tempCollections = [];

        for (let i = 0; i < collection_preinfo.length; i++) {
            try {
                const myAsset = new ERC725(lsp4Schema, collection_preinfo[i].address, 'https://rpc.mainnet.lukso.network',
                    {
                        ipfsGateway: 'https://api.universalprofile.cloud/ipfs',
                    },
                );

                const assetMetadata = await myAsset.fetchData('LSP4Metadata');

                tempCollections.push({
                    name: collection_preinfo[i].name,
                    avatar: assetMetadata.value.LSP4Metadata?.icon?.at(0)?.url ? (assetMetadata.value.LSP4Metadata?.icon?.at(0)?.url.match("ipfs://") ? assetMetadata.value.LSP4Metadata?.icon?.at(0)?.url.replace("ipfs://", "https://api.universalprofile.cloud/ipfs/") : assetMetadata.value.LSP4Metadata?.icon?.at(0)?.url) : default_avatar,
                    banner: assetMetadata.value.LSP4Metadata?.backgroundImage?.at(0)?.url ? (assetMetadata.value.LSP4Metadata?.backgroundImage?.at(0)?.url.match("ipfs://") ? assetMetadata.value.LSP4Metadata?.backgroundImage?.at(0)?.url.replace("ipfs://", "https://api.universalprofile.cloud/ipfs/") : assetMetadata.value.LSP4Metadata?.backgroundImage?.at(0)?.url) : default_banner,
                    address: collection_preinfo[i].address,
                    interest: collection_preinfo[i].interest,
                    duration: collection_preinfo[i].duration
                });
            } catch (error) {
                console.log(error);
            }
        }

        setCollections(tempCollections);
        setIsLoading(false);
    }

    useEffect(() => {
        if (!isLoading && collections.length == 0) {
            fetchMetadata();
        }
    }, [])

    return { fetchMetadata, collections, isLoading };
}
export const CollectionsContext = createContext();

export const CollectionsProvider = (props) => {
    const collectionsContext = useCollectionsContext();

    return (
        <div>
            <CollectionsContext.Provider value={{ ...collectionsContext }}>
                {props.children}
            </CollectionsContext.Provider>
        </div>
    );
};