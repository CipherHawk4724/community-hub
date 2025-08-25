"use client";
import { useState } from "react";
import { ethers } from "ethers";

export default function WalletConnect() {
  const [account, setAccount] = useState<string | null>(null);

  async function connectWallet() {
    if (typeof window.ethereum === "undefined") {
      alert("Please install MetaMask!");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      setAccount(accounts[0]);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div>
      {account ? (
        <p className="text-green-600 font-semibold">
          Connected: {account.slice(0, 6)}...{account.slice(-4)}
        </p>
      ) : (
        <button
          onClick={connectWallet}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
}
