// app/donate/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import Navbar from "components/Navbar";

// Deployed CommunityHub contract address
const COMMUNITY_HUB_ADDRESS = "0xd927807767655E6e818af8EBbCf6cf41890E253c";

// Minimal ABI for fetching proposals and donating
const COMMUNITY_HUB_ABI = [
  "function listProposals(uint256 fromId, uint256 toId) external view returns (tuple(uint256 id,address creator,address payable beneficiary,string description,uint256 votesYes,uint256 votesNo,uint256 donated,uint256 createdAt,bool open)[])",
  "function donate(uint256 id) external payable"
];

type Proposal = {
  id: number;
  creator: string;
  beneficiary: string;
  description: string;
  votesYes: number;
  votesNo: number;
  donated: bigint;
  createdAt: number;
  open: boolean;
};


const DonatePage: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [selectedProposalId, setSelectedProposalId] = useState<number | null>(null);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Auto-connect wallet
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.request({ method: "eth_accounts" })
        .then((accounts: string[]) => {
          if (accounts.length > 0) setWalletAddress(accounts[0]);
        })
        .catch(console.error);
    }
  }, []);

  // Connect wallet manually
  const connectWallet = async () => {
    try {
      if (!window.ethereum) throw new Error("MetaMask not installed");
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setWalletAddress(accounts[0]);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to connect wallet");
    }
  };

  // Fetch proposals from contract
  const fetchProposals = async () => {
    try {
      if (!window.ethereum) throw new Error("MetaMask not installed");
      const provider = new ethers.BrowserProvider(window.ethereum, "any");
      const contract = new ethers.Contract(COMMUNITY_HUB_ADDRESS, COMMUNITY_HUB_ABI, provider);
      
      // For simplicity, fetch proposals 1-20
      const results: Proposal[] = await contract.listProposals(1, 20);
      setProposals(results);
    } catch (err: any) {
      console.error(err);
      setError("Failed to fetch proposals");
    }
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  // Handle donation
  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setTxHash(null);

    if (!selectedProposalId || !amount) {
      setError("Please select a proposal and enter an amount");
      return;
    }

    try {
      if (!window.ethereum) throw new Error("MetaMask not installed");
      setLoading(true);

      const provider = new ethers.BrowserProvider(window.ethereum, "any");
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(COMMUNITY_HUB_ADDRESS, COMMUNITY_HUB_ABI, signer);

      const tx = await contract.donate(selectedProposalId, {
        value: ethers.parseEther(amount)
      });

      setTxHash(tx.hash);
      await tx.wait();

      setAmount("");
      setSelectedProposalId(null);
      fetchProposals();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Transaction failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-3xl mx-auto p-6">
        <h1 className="text-4xl font-bold text-blue-600 mb-6 text-center">
          Donate to a Proposal
        </h1>

        {!walletAddress ? (
          <div className="text-center mb-6">
            <button
              onClick={connectWallet}
              className="px-6 py-3 bg-blue-600 text-black rounded-lg hover:bg-blue-700 transition"
            >
              Connect Wallet
            </button>
            {error && <p className="text-red-500 mt-2">{error}</p>}
          </div>
        ) : (
          <p className="text-gray-700 mb-4 text-center">
            Connected wallet: {walletAddress}
          </p>
        )}

<form onSubmit={handleDonate} className="space-y-4 bg-white p-6 rounded-lg shadow">
  <div>
    <label className="block mb-1 font-semibold text-black">Select Proposal</label>
    <select
      className="w-full p-3 border rounded-lg text-black"
      value={selectedProposalId ?? ""}
      onChange={(e) => setSelectedProposalId(Number(e.target.value))}
    >
      <option value="">-- Select Proposal --</option>
      {proposals.map((p) => (
        <option key={p.id} value={p.id}>
          {p.id} - {p.description.slice(0, 50)} {p.open ? "(Open)" : "(Closed)"}
        </option>
      ))}
    </select>
  </div>

  <div>
    <label className="block mb-1 font-semibold text-black">Amount (SHM)</label>
    <input
      type="number"
      step="0.01"
      className="w-full p-3 border rounded-lg text-black"
      value={amount}
      onChange={(e) => setAmount(e.target.value)}
      placeholder="Enter amount in SHM"
    />
  </div>

  {error && <p className="text-red-500">{error}</p>}
  {txHash && (
    <p className="text-green-600">
      Donation successful! Tx:{" "}
      <a
        href={`https://explorer.testnet.shardeum.org/tx/${txHash}`}
        target="_blank"
        rel="noopener noreferrer"
        className="underline text-black"
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
    {loading ? "Donating..." : "Donate"}
  </button>
</form>
      </main>
    </div>
  );
};

export default DonatePage;
