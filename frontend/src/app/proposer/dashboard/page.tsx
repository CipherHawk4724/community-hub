// app/proposer/dashboard/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import Link from "next/link";

// Contract info
const COMMUNITY_HUB_ADDRESS = "0xd927807767655E6e818af8EBbCf6cf41890E253c";

// Minimal ABI for proposals and closing
const COMMUNITY_HUB_ABI = [
  "function listProposals(uint256 fromId, uint256 toId) external view returns (tuple(uint256 id,address creator,address payable beneficiary,string description,uint256 votesYes,uint256 votesNo,uint256 donated,uint256 createdAt,bool open)[])",
  // 🚩 NEW ASSUMED FUNCTION: Proposer closes the proposal
  "function closeProposal(uint256 id) external"
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

const ProposerDashboardPage: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // --- Wallet Connection Logic ---
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.request({ method: "eth_accounts" })
        .then((accounts: string[]) => {
          if (accounts.length > 0) setWalletAddress(accounts[0]);
        })
        .catch(console.error);
    }
  }, []);

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

  // --- Proposal Fetching Logic ---
  const fetchProposals = async () => {
    try {
      if (!window.ethereum) throw new Error("MetaMask not installed");
      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum, "any");
      const contract = new ethers.Contract(COMMUNITY_HUB_ADDRESS, COMMUNITY_HUB_ABI, provider);

      // Fetch proposals 1–20 (Same as home page, will filter below)
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
  
  // --- Close Proposal Logic ---
  const handleCloseProposal = async (proposalId: number) => {
    try {
      if (!window.ethereum) throw new Error("MetaMask not installed");
      if (!walletAddress) throw new Error("Wallet not connected");
      setLoading(true);
      setError(null);
      setTxHash(null);

      const provider = new ethers.BrowserProvider(window.ethereum, "any");
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(COMMUNITY_HUB_ADDRESS, COMMUNITY_HUB_ABI, signer);

      const tx = await contract.closeProposal(proposalId);
      setTxHash(tx.hash);
      await tx.wait();

      // Refresh the list to show the updated status
      await fetchProposals(); 
    } catch (err: any) {
      console.error("Full Transaction Error Object:", err);
      
      let userFriendlyMessage = "Closing failed. Please check wallet for details.";

      // Error Filtering Logic
      if (err.code === 4001 || (err.message && err.message.includes("user rejected"))) {
          userFriendlyMessage = "Transaction rejected by user.";
      } else if (err.code === -32603 || (err.message && err.message.includes("-32603"))) {
          // This typically means the contract reverted (e.g., user is not the creator, or already closed)
          userFriendlyMessage = "Closing failed: Contract rejected the transaction (Are you the creator? Is it already closed?).";
      } else if (err.shortMessage) {
          userFriendlyMessage = `Closing failed: ${err.shortMessage.split('(')[0].trim()}`;
      }
      
      setError(userFriendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  // Filter proposals to show only those created by the connected wallet
  const proposerProposals = proposals.filter(p => 
      walletAddress && p.creator.toLowerCase() === walletAddress.toLowerCase()
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-5xl mx-auto p-6">
        <h1 className="text-4xl font-bold text-blue-600 mb-6 text-center">
          Proposer Dashboard
        </h1>

        {/* Wallet Connection Status */}
        {!walletAddress ? (
          <div className="text-center mb-6">
            <button
              onClick={connectWallet}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Connect Wallet to View Your Proposals
            </button>
            {error && <p className="text-red-500 mt-2">{error}</p>}
          </div>
        ) : (
          <div className="text-center mb-6 p-4 border rounded-lg bg-white shadow-sm">
            <p className="text-gray-700 font-semibold flex items-center justify-center">
              Viewing proposals created by:
              <span 
                  className="ml-2 font-mono text-sm max-w-[200px] sm:max-w-xs md:max-w-md 
                             overflow-hidden whitespace-nowrap text-ellipsis"
                >
                {walletAddress}
              </span>
            </p>
          </div>
        )}

        {loading && <p className="text-center text-gray-500 mb-4">Loading proposals...</p>}
        {error && <p className="text-red-500 mb-4 text-center font-semibold">{error}</p>}
        {txHash && (
          <p className="text-green-600 mb-4 text-center font-semibold">
            Transaction submitted! Tx:{" "}
            <a href={`https://explorer-unstable.shardeum.org/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="underline text-blue-600">
              {txHash.substring(0, 10)}...
            </a>
          </p>
        )}

        {/* Proposal List Filtered by Creator */}
        <div className="grid gap-6 md:grid-cols-2">
          {walletAddress && proposerProposals.length === 0 && !loading && (
             <p className="text-center text-gray-700 md:col-span-2">
                 You have not created any proposals yet.
             </p>
          )}

          {proposerProposals.map((p) => (
            <div key={p.id} className="bg-white p-4 rounded-lg shadow border-2 border-blue-100">
              <h2 className="font-bold text-lg text-black mb-2">{p.description}</h2>
              <p className="text-gray-500 text-sm mb-1">Proposal ID: {p.id}</p>
              <p className="text-gray-700 text-sm mb-1">
                Beneficiary: <span className="font-mono">{p.beneficiary}</span>
              </p>
              <p className="text-gray-700 text-sm mb-2">
                Total Donated: <span className="font-semibold text-purple-700">{ethers.formatEther(p.donated)} SHM</span>
              </p>
              <p className="text-gray-500 text-xs mb-3">
                Status: <span className={`font-bold ${p.open ? "text-green-600" : "text-red-600"}`}>{p.open ? "Open" : "Closed"}</span>
              </p>

              <div className="flex gap-2 flex-wrap">
                {p.open ? (
                  <button
                    onClick={() => handleCloseProposal(p.id)}
                    disabled={loading || !walletAddress}
                    className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:bg-gray-400 font-semibold"
                  >
                    {loading ? 'Closing...' : 'Close Proposal'}
                  </button>
                ) : (
                    <p className="text-gray-500 text-sm py-2">Funding period finalized.</p>
                )}
                
                <Link
                  href={`/proposal/${p.id}`}
                  className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default ProposerDashboardPage;