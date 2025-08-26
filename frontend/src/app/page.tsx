// app/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import Navbar from "components/Navbar";
import Link from "next/link";

// Contract info
const COMMUNITY_HUB_ADDRESS = "0xd927807767655E6e818af8EBbCf6cf41890E253c";

// Minimal ABI for proposals
const COMMUNITY_HUB_ABI = [
  "function listProposals(uint256 fromId, uint256 toId) external view returns (tuple(uint256 id,address creator,address payable beneficiary,string description,uint256 votesYes,uint256 votesNo,uint256 donated,uint256 createdAt,bool open)[])"
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


const HomePage: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(false);
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
      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum, "any");
      const contract = new ethers.Contract(COMMUNITY_HUB_ADDRESS, COMMUNITY_HUB_ABI, provider);

      // Fetch proposals 1–20
      const results: Proposal[] = await contract.listProposals(1, 20);
      setProposals(results);
    } catch (err: any) {
      console.error(err);
      setError("Failed to fetch proposals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-5xl mx-auto p-6">
        <h1 className="text-4xl font-bold text-blue-600 mb-6 text-center">
          Community Hub Dashboard
        </h1>

        {!walletAddress ? (
          <div className="text-center mb-6">
            <button
              onClick={connectWallet}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Connect Wallet
            </button>
            {error && <p className="text-red-500 mt-2">{error}</p>}
          </div>
        ) : (
          <p className="text-gray-700 mb-6 text-center">
            Connected wallet: {walletAddress}
          </p>
        )}

        {loading && <p className="text-center text-gray-500 mb-4">Loading proposals...</p>}
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

        <div className="grid gap-6 md:grid-cols-2">
          {proposals.map((p) => (
            <div key={p.id} className="bg-white p-4 rounded-lg shadow">
              <h2 className="font-semibold text-lg mb-2">{p.description}</h2>
              <p className="text-gray-500 text-sm mb-1">
                Proposal ID: {p.id} | Creator: {p.creator}
              </p>
              <p className="text-gray-500 text-sm mb-1">
                Beneficiary: {p.beneficiary}
              </p>
              <p className="text-gray-700 text-sm mb-1">
                Votes: Yes {p.votesYes.toString()} | No {p.votesNo.toString()}
              </p>
              <p className="text-gray-700 text-sm mb-2">
                Total Donated: {ethers.formatEther(p.donated)} SHM
              </p>
              <p className="text-gray-500 text-xs mb-2">
                {p.open ? "Status: Open" : "Status: Closed"}
              </p>

              <div className="flex gap-2 flex-wrap">
                {p.open && (
                  <>
                    <Link
                      href="/vote"
                      className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                      Vote
                    </Link>
                    <Link
                      href="/donate"
                      className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                    >
                      Donate
                    </Link>
                  </>
                )}
                <Link
                  href={`/proposal/${p.id}`}
                  className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                >
                  View
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default HomePage;
