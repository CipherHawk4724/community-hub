// app/vote/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import Navbar from "components/Navbar";

// Deployed CommunityHub contract address
const COMMUNITY_HUB_ADDRESS = "0xd927807767655E6e818af8EBbCf6cf41890E253c";

// Minimal ABI for proposals and voting
const COMMUNITY_HUB_ABI = [
  "function listProposals(uint256 fromId, uint256 toId) external view returns (tuple(uint256 id,address creator,address payable beneficiary,string description,uint256 votesYes,uint256 votesNo,uint256 donated,uint256 createdAt,bool open)[])",
  "function vote(uint256 id, bool support) external"
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

const VotePage: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
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

  // Handle voting
  const handleVote = async (proposalId: number, support: boolean) => {
    try {
      if (!window.ethereum) throw new Error("MetaMask not installed");
      setLoading(true);
      setError(null);
      setTxHash(null);

      const provider = new ethers.BrowserProvider(window.ethereum, "any");
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(COMMUNITY_HUB_ADDRESS, COMMUNITY_HUB_ABI, signer);

      const tx = await contract.vote(proposalId, support);
      setTxHash(tx.hash);
      await tx.wait();

      fetchProposals(); // Refresh votes
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
      <h1 className="text-4xl font-bold text-black mb-6 text-center">
        Vote on Proposals
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
        <p className="text-black mb-4 text-center">
          Connected wallet: {walletAddress}
        </p>
      )}

    {error && <p className="text-red-500 mb-4">{error}</p>}
    {txHash && (
      <p className="text-green-600 mb-4">
        Vote submitted! Tx:{" "}
        <a
          href={`https://explorer-unstable.shardeum.org/tx/${txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-black"
        >
          {txHash}
        </a>
      </p>
    )}

        <div className="space-y-4">
          {proposals.map((p) => (
          <div key={p.id} className="bg-white p-4 rounded-lg shadow">
            <h2 className="font-semibold text-lg mb-1 text-black">{p.description}</h2>
              <p className="text-black text-sm mb-2">
                Proposal ID: {p.id} | Beneficiary: {p.beneficiary}
              </p>
              <p className="text-gray-700 text-sm mb-2">
                Votes: Yes {p.votesYes.toString()} | No {p.votesNo.toString()}
              </p>
              {p.open ? (
                <div className="flex gap-4">
                  <button
                    onClick={() => handleVote(p.id, true)}
                    disabled={loading || !walletAddress}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-gray-400"
                  >
                    Vote Yes
                  </button>
                  <button
                    onClick={() => handleVote(p.id, false)}
                    disabled={loading || !walletAddress}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:bg-gray-400"
                  >
                    Vote No
                  </button>
                </div>
              ) : (
              <p className="text-black">This proposal is closed.</p>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default VotePage;
