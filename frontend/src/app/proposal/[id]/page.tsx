// app/proposal/[id]/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import Link from 'next/link';

// Contract info (Consistent)
const COMMUNITY_HUB_ADDRESS = "0xd927807767655E6e818af8EBbCf6cf41890E253c";

// Minimal ABI for proposals, voting, and checking vote status
const COMMUNITY_HUB_ABI = [
  "function listProposals(uint256 fromId, uint256 toId) external view returns (tuple(uint256 id,address creator,address payable beneficiary,string description,uint256 votesYes,uint256 votesNo,uint256 donated,uint256 createdAt,bool open)[])",
  "function vote(uint256 id, bool support) external",
  // Function to check if an address has voted on a proposal. Assumes returns 0=NoVote, 1=Yes, 2=No
  "function getVoteStatus(uint256 id, address voter) external view returns (uint8)" 
];

// Re-use the Proposal Type
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

// Define the component and accept the dynamic parameter 'id'
const ProposalDetailPage = ({ params }: { params: { id: string } }) => {
  const proposalId = params.id;
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [userVoteStatus, setUserVoteStatus] = useState<number>(0); // 0=NoVote, 1=Yes, 2=No
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [isVoting, setIsVoting] = useState(false);

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

  // --- Vote Status Check Logic ---
  const checkVoteStatus = async (id: number, address: string) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum, "any");
      const contract = new ethers.Contract(COMMUNITY_HUB_ADDRESS, COMMUNITY_HUB_ABI, provider);
      
      // Call the assumed contract view function
      const status: bigint = await contract.getVoteStatus(id, address);
      
      setUserVoteStatus(Number(status)); 
    } catch (err) {
      console.error("Failed to check vote status:", err);
      // Default to 0 (NoVote) if the function call fails
      setUserVoteStatus(0); 
    }
  };


  // --- Data Fetching Logic ---
  const fetchProposal = async (id: number) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum, "any");
      const contract = new ethers.Contract(COMMUNITY_HUB_ADDRESS, COMMUNITY_HUB_ABI, provider);
      const results: Proposal[] = await contract.listProposals(id, id);

      if (results.length > 0) {
        setProposal(results[0]);
      } else {
        setError("Proposal not found or invalid ID.");
      }

    } catch (err: any) {
      console.error(err);
      setError("Failed to fetch proposal details.");
    } finally {
      setLoading(false);
    }
  };

  // Initial proposal fetch
  useEffect(() => {
    const idNum = Number(proposalId);
    if (!isNaN(idNum) && idNum > 0) {
        fetchProposal(idNum);
    } else {
        setError("Invalid Proposal ID provided in the URL.");
        setLoading(false);
    }
  }, [proposalId]);

  // Check vote status when proposal and wallet are ready
  useEffect(() => {
    if (proposal && walletAddress) {
        checkVoteStatus(proposal.id, walletAddress);
    } else {
        setUserVoteStatus(0); 
    }
  }, [proposal, walletAddress]);


  // --- Voting Logic ---
  const handleVote = async (id: number, support: boolean) => {
    try {
      if (!window.ethereum) throw new Error("MetaMask not installed");
      if (!walletAddress) throw new Error("Wallet not connected");
      setIsVoting(true);
      setError(null);
      setTxHash(null);

      const provider = new ethers.BrowserProvider(window.ethereum, "any");
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(COMMUNITY_HUB_ADDRESS, COMMUNITY_HUB_ABI, signer);

      const tx = await contract.vote(id, support);
      setTxHash(tx.hash);
      await tx.wait();

      // Re-fetch data to update votes and status
      await fetchProposal(id); 
      await checkVoteStatus(id, walletAddress);

    } catch (err: any) {
      console.error(err);
      
      // 🚩 KEY CHANGE HERE: Filter the error message
      let userFriendlyMessage = "Transaction failed. Please check wallet for details.";

      // Common pattern: If the error is complex (like the coalesced error), look for the internal message.
      if (err.message && err.message.includes("user rejected transaction")) {
          userFriendlyMessage = "Transaction rejected by user.";
      } else if (err.message && err.message.includes("-32603") || err.code === -32603) {
          // This covers the generic "Internal JSON-RPC error" which usually means the contract reverted.
          userFriendlyMessage = "Vote failed: Contract rejected the transaction (e.g., already voted, proposal closed, or no voting power).";
      } else if (err.reason) {
          userFriendlyMessage = `Transaction failed: ${err.reason}`;
      }
      
      setError(userFriendlyMessage); // Set the simplified message
      
    } finally {
      setIsVoting(false);
    }
};


  // --- Render Logic (Themed) ---

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-5xl mx-auto p-6">
        
        <h1 className="text-4xl font-bold text-blue-600 mb-8 text-center">
          Proposal Details
        </h1>

        {/* Wallet Connection Display/Button */}
        {!walletAddress ? (
          <div className="text-center mb-6">
            <button
              onClick={connectWallet}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Connect Wallet
            </button>
          </div>
        ) : (
          <p className="text-gray-700 mb-6 text-center">
            Connected wallet: {walletAddress}
          </p>
        )}
        
        {/* Loading and Error States */}
        {loading && <p className="text-center text-gray-500 mb-4">Loading proposal {proposalId}...</p>}
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

        {/* Transaction Status */}
        {txHash && (
          <p className="text-green-600 mb-4 text-center">
            Vote submitted! Tx:{" "}
            <a
              href={`https://explorer-unstable.shardeum.org/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-blue-600 hover:text-blue-800"
            >
              {txHash.substring(0, 10)}...
            </a>
          </p>
        )}

        {/* Proposal Card (Themed) */}
        {!loading && !error && proposal && (
          <div className="bg-white p-6 rounded-xl shadow-2xl">
            <h2 className="text-2xl font-bold text-black mb-4 border-b pb-2">
              {proposal.description}
            </h2>

            {/* Proposal Details */}
            <div className="space-y-3 text-gray-700">
              <p className="text-lg">
                <span className="font-semibold text-blue-700">Creator:</span> {proposal.creator}
              </p>
              <p className="text-lg">
                <span className="font-semibold text-blue-700">Beneficiary:</span> {proposal.beneficiary}
              </p>
              <p className="text-lg">
                <span className="font-semibold text-purple-700">Total Donated:</span>{" "}
                <span className="font-mono">{ethers.formatEther(proposal.donated)} SHM</span>
              </p>
            </div>

            {/* Votes Section */}
            <div className="mt-5 pt-4 border-t border-gray-200">
              <p className="text-xl font-bold mb-3 text-gray-800">Voting Results</p>
              <div className="flex gap-4">
                <p className="text-lg bg-green-100 p-3 rounded-md">
                  <span className="font-semibold text-green-600">YES Votes: {proposal.votesYes.toString()}</span> 
                </p>
                <p className="text-lg bg-red-100 p-3 rounded-md">
                  <span className="font-semibold text-red-600">NO Votes: {proposal.votesNo.toString()}</span>
                </p>
              </div>
            </div>

            {/* Status and Action Buttons */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className={`text-lg font-bold mb-4 ${proposal.open ? 'text-green-600' : 'text-red-600'}`}>
                Status: {proposal.open ? "Open" : "Closed"}
              </p>

                {/* Display Vote Status Message */}
                {userVoteStatus === 1 && (
                    <p className="text-xl font-bold text-green-700 mb-4 bg-green-50 p-3 rounded-lg">
                        ✅ You have already Voted YES on this proposal.
                    </p>
                )}
                {userVoteStatus === 2 && (
                    <p className="text-xl font-bold text-red-700 mb-4 bg-red-50 p-3 rounded-lg">
                        ❌ You have already Voted NO on this proposal.
                    </p>
                )}


              <div className="flex gap-4 flex-wrap">
                {proposal.open && userVoteStatus === 0 ? ( // Condition: Open AND No Vote Yet
                  <>
                    <button
                      onClick={() => handleVote(proposal.id, true)}
                      disabled={isVoting || !walletAddress}
                      className="px-4 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition disabled:bg-gray-400 shadow"
                    >
                      {isVoting ? 'Voting YES...' : 'Vote YES'}
                    </button>
                    <button
                      onClick={() => handleVote(proposal.id, false)}
                      disabled={isVoting || !walletAddress}
                      className="px-4 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition disabled:bg-gray-400 shadow"
                    >
                      {isVoting ? 'Voting NO...' : 'Vote NO'}
                    </button>
                    <Link
                      href="/donate"
                      className="px-4 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition shadow"
                    >
                      Donate
                    </Link>
                  </>
                ) : proposal.open ? ( // If Open BUT userVoteStatus is 1 or 2
                    <Link
                      href="/donate"
                      className="px-4 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition shadow"
                    >
                      Donate
                    </Link>
                ) : (
                  <p className="text-gray-500">Voting is closed for this proposal.</p>
                )}
                
                {/* Back to Dashboard Button */}
                <Link
                  href="/"
                  className="px-4 py-3 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition shadow"
                >
                  ← Back to Dashboard
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProposalDetailPage;