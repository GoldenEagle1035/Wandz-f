
import { getTargetNetwork } from "../../utils/wandz-eth/network";

const DEFAULT_NETWORK_COLOR = ["#666666", "#bbbbbb"];

/**
 * Gets the color of the target network
 */
export const useNetworkColor = () => {

    const isDarkMode = true; //false

    const colorConfig = getTargetNetwork().color ?? DEFAULT_NETWORK_COLOR;

    return Array.isArray(colorConfig) ? (isDarkMode ? colorConfig[1] : colorConfig[0]) : colorConfig;
};
