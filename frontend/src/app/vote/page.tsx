"use client";

import { useState } from "react";
import WalletConnect from "../../components/WalletConnect";

type Proposal = {
  id: number;
  description: string;
  votes: number;
};

export default function VotePage() {
  const [proposals, setProposals] = useState<Proposal[]>([
    { id: 1, description: "Fund community clean water project", votes: 12 },
    { id: 2, description: "Support local coding bootcamp", votes: 7 },
    { id: 3, description: "Organize mental health awareness event", votes: 20 },
  ]);

  const handleVote = (id: number) => {
    // 🔗 Later: call smart contract vote(id)
    setProposals((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, votes: p.votes + 1 } : p
      )
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Wallet Connection */}
      <div className="flex justify-end">
        <WalletConnect />
      </div>

      {/* Page Header */}
      <h1 className="text-2xl font-bold">Vote on Proposals</h1>

      {/* Proposals List */}
      <div className="space-y-4">
        {proposals.length > 0 ? (
          proposals.map((proposal) => (
            <div
              key={proposal.id}
              className="flex justify-between items-center border rounded-lg p-4 bg-white shadow"
            >
              <div>
                <h2 className="text-lg font-semibold">
                  Proposal #{proposal.id}
                </h2>
                <p>{proposal.description}</p>
                <p className="text-sm text-gray-600">
                  Votes: {proposal.votes}
                </p>
              </div>
              <button
                onClick={() => handleVote(proposal.id)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Vote
              </button>
            </div>
          ))
        ) : (
          <p>No proposals to vote on.</p>
        )}
      </div>
    </div>
  );
}
