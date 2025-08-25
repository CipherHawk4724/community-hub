import { ExternalProvider } from "@ethersproject/providers";

declare global {
  interface Window {
    ethereum?: ExternalProvider & {
      isMetaMask?: boolean;
      request?: (args: { method: string; params?: any[] }) => Promise<any>;
    };
  }
}

export {};
