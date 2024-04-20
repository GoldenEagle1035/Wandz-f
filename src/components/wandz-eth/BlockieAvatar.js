import { blo } from "blo";

// Custom Avatar for RainbowKit
export const BlockieAvatar = ({ address, ensImage, size }) => (
  
  <img
    className="rounded-full"
    src={ensImage || blo(address)}
    width={size}
    height={size}
    alt={`${address} avatar`}
  />
);
