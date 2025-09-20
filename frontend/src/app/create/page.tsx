"use client";

import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import Navbar from "components/Navbar";

// Deployed CommunityHub contract address on Shardeum testnet
const COMMUNITY_HUB_ADDRESS = "0xd927807767655E6e818af8EBbCf6cf41890E253c";

// Minimal ABI for createProposal
const COMMUNITY_HUB_ABI = [
  "function createProposal(string calldata description, address payable beneficiary) external returns (uint256)"
];

// Shardeum network details
const SHARDEUM_NETWORK_PARAMS = {
  chainId: "0x1F90", // 8080 in hex, example for Shardeum Unstable
  chainName: "Shardeum Unstable",
  nativeCurrency: {
    name: "Shardeum",
    symbol: "SHM",
    decimals: 18,
  },
  rpcUrls: ["https://api-unstable.shardeum.org"],
  blockExplorerUrls: ["https://explorer-unstable.shardeum.org"],
};

const CreateProposalPage: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [beneficiary, setBeneficiary] = useState("");
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Auto-connect wallet on page load
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.request({ method: "eth_accounts" })
        .then((accounts: string[]) => {
          if (accounts.length > 0) setWalletAddress(accounts[0]);
        })
        .catch(console.error);
    }
  }, []);

  // Switch network to Shardeum if not already
  const switchToShardeum = async () => {
    if (!window.ethereum) throw new Error("MetaMask not installed");
    try {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [SHARDEUM_NETWORK_PARAMS],
      });
    } catch (err: any) {
      if (err.code === 4001) throw new Error("User rejected network change");
      throw err;
    }
  };

  // Connect wallet manually
  const connectWallet = async () => {
    try {
      if (!window.ethereum) throw new Error("MetaMask not installed");
      await switchToShardeum();
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setWalletAddress(accounts[0]);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to connect wallet");
    }
  };

  // Handle proposal creation
  const handleCreateProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setTxHash(null);

    if (!description || !beneficiary) {
      setError("Please fill all fields");
      return;
    }

    try {
      if (!window.ethereum) throw new Error("MetaMask not installed");
      setLoading(true);

      // Ensure user is on Shardeum network
      await switchToShardeum();

      // Connect to Shardeum via MetaMask
      const provider = new ethers.BrowserProvider(window.ethereum, "any");
      const signer = await provider.getSigner();

      const contract = new ethers.Contract(COMMUNITY_HUB_ADDRESS, COMMUNITY_HUB_ABI, signer);

      // Send transaction (using SHM)
      const tx = await contract.createProposal(description, beneficiary);
      setTxHash(tx.hash);

      await tx.wait();
      setDescription("");
      setBeneficiary("");
    } catch (err: any) {
      setError(err.message || "Transaction failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-2xl mx-auto p-6">
        <h1 className="text-4xl font-bold text-black mb-6 text-center">
          Create a Proposal
        </h1>

        {!walletAddress ? (
          <div className="text-center mb-6">
            <button
              onClick={connectWallet}
              className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition"
            >
              Connect Wallet
            </button>
            {error && <p className="text-red-500 mt-2">{error}</p>}
          </div>
        ) : (
<div className="text-center mb-6 p-4 border rounded-lg bg-white shadow-sm">
            <p className="text-black font-semibold flex items-center justify-center">
              Connected wallet:
              <span 
                  className="ml-2 font-mono text-sm max-w-[200px] sm:max-w-xs 
                             overflow-hidden whitespace-nowrap text-ellipsis"
                >
                {walletAddress}
              </span>
            </p>
          </div>
        )}

        <form onSubmit={handleCreateProposal} className="space-y-4 bg-white p-6 rounded-lg shadow">
          <div>
            <label className="block mb-1 font-semibold text-black">Proposal Description</label>
            <textarea
              className="w-full p-3 border rounded-lg text-black"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Enter your proposal description"
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold text-black">Beneficiary Wallet Address</label>
            <input
              type="text"
              className="w-full p-3 border rounded-lg text-black"
              value={beneficiary}
              onChange={(e) => setBeneficiary(e.target.value)}
              placeholder="0x..."
            />
          </div>

          {error && <p className="text-red-500">{error}</p>}
          {txHash && (
            <p className="text-green-600">
              Proposal created! Tx:{" "}
              <a
                href={`https://explorer.testnet.shardeum.org/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                {txHash}
              </a>
            </p>
          )}

          <button
            type="submit"
            className={`w-full px-6 py-3 text-white rounded-lg transition ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-black hover:bg-gray-800"
            }`}
            disabled={loading || !walletAddress}
          >
            {loading ? "Creating..." : "Create Proposal"}
          </button>
        </form>
      </main>
    </div>
  );
};

export default CreateProposalPage;
