"use client";

import React, { useState } from "react";
import { ethers } from "ethers";

interface Proposal {
  id: number;
  creator: string;
  beneficiary: string;
  description: string;
  votesYes: number;
  votesNo: number;
  donated: string;
  createdAt: number;
  open: boolean;
}

interface ProposalCardProps {
  proposal: Proposal;
  contract: ethers.Contract | null;
  onVote?: (id: number, support: boolean) => Promise<void>;
  onDonate?: (id: number, amount: string) => Promise<void>;
  loading?: boolean;
}

const ProposalCard: React.FC<ProposalCardProps> = ({
  proposal,
  contract,
  onVote,
  onDonate,
  loading = false,
}) => {
  const [donateAmount, setDonateAmount] = useState<string>("0");

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-2">Proposal #{proposal.id}</h3>
      <p className="text-gray-700 mb-2">{proposal.description}</p>
      <p className="text-gray-500 text-sm mb-2">
        Creator: {proposal.creator.slice(0, 6)}...{proposal.creator.slice(-4)}
      </p>
      <p className="text-gray-500 text-sm mb-2">
        Beneficiary: {proposal.beneficiary.slice(0, 6)}...{proposal.beneficiary.slice(-4)}
      </p>
      <p className="text-gray-700 mb-2">
        Votes: Yes {proposal.votesYes} / No {proposal.votesNo}
      </p>
      <p className="text-gray-700 mb-2">Donated: {proposal.donated} ETH</p>
      <p className="text-gray-500 text-sm mb-4">
        Status: {proposal.open ? "Open" : "Closed"}
      </p>

      {/* Voting buttons */}
      {onVote && proposal.open && (
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => onVote(proposal.id, true)}
            disabled={loading}
            className="flex-1 bg-green-600 text-white py-1 rounded hover:bg-green-700 transition"
          >
            Vote Yes
          </button>
          <button
            onClick={() => onVote(proposal.id, false)}
            disabled={loading}
            className="flex-1 bg-red-600 text-white py-1 rounded hover:bg-red-700 transition"
          >
            Vote No
          </button>
        </div>
      )}

      {/* Donation input */}
      {onDonate && proposal.open && (
        <div className="flex gap-2">
          <input
            type="number"
            value={donateAmount}
            onChange={(e) => setDonateAmount(e.target.value)}
            placeholder="ETH amount"
            className="flex-1 border border-gray-300 rounded-md p-1"
          />
          <button
            onClick={() => onDonate(proposal.id, donateAmount)}
            disabled={loading || Number(donateAmount) <= 0}
            className="bg-blue-600 text-white py-1 px-3 rounded hover:bg-blue-700 transition"
          >
            Donate
          </button>
        </div>
      )}
    </div>
  );
};

export default ProposalCard;
