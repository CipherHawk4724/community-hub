"use client";

import React, { useEffect, useState } from "react";

interface WalletConnectProps {
  connectWallet: () => Promise<void>;
  account: string;
}

const BANKAI_CHAIN_ID = "0x1F40"; // 9090 in hex

const WalletConnect: React.FC<WalletConnectProps> = ({ connectWallet, account }) => {
  const [wrongNetwork, setWrongNetwork] = useState(false);

  useEffect(() => {
    const checkNetwork = async () => {
      if (window.ethereum && account) {
        try {
          const chainId = await window.ethereum.request({ method: "eth_chainId" });
          setWrongNetwork(chainId !== BANKAI_CHAIN_ID);
        } catch (err) {
          console.error("Failed to get chainId:", err);
          setWrongNetwork(true);
        }
      } else {
        setWrongNetwork(false);
      }
    };

    checkNetwork();

    if (window.ethereum) {
      window.ethereum.on("chainChanged", checkNetwork);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("chainChanged", checkNetwork);
      }
    };
  }, [account]);

  return (
    <div className="bg-white shadow p-4 flex justify-end items-center space-x-4">
      {account ? (
        <>
          <div className="text-gray-700 font-semibold">
            Connected: {account.slice(0, 6)}...{account.slice(-4)}
          </div>
          {wrongNetwork && (
            <div className="text-red-600 font-semibold">Wrong Network!</div>
          )}
        </>
      ) : (
        <button
          onClick={connectWallet}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
};

export default WalletConnect;
