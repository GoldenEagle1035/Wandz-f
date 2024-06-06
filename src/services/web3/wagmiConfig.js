import { createConfig, http } from "wagmi";
import { configuredNetwork, wagmiConnectors } from "./wagmiConnectors";

export const wagmiConfig = createConfig({
  chains: [configuredNetwork],
  connectors: wagmiConnectors,
  transports: {
    [configuredNetwork.id]: http()
  }
});
