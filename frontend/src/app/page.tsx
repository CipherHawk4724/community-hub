"use client";

import { useState } from "react";
import ProposalCard from "../components/ProposalCard";
import WalletConnect from "../components/WalletConnect";

// Define Proposal type
type Proposal = {
  id: number;
  description: string;
  votes: number;
  donations: number;
};

export default function HomePage() {
  // Dummy proposals for now (later fetched from smart contract)
  const [proposals] = useState<Proposal[]>([
    { id: 1, description: "Fund community clean water project", votes: 12, donations: 3 },
    { id: 2, description: "Support local coding bootcamp", votes: 7, donations: 5 },
    { id: 3, description: "Organize mental health awareness event", votes: 20, donations: 8 },
  ]);

  return (
    <div className="space-y-6">
      {/* Wallet Connection */}
      <div className="flex justify-end">
        <WalletConnect />
      </div>

      {/* Page Header */}
      <h1 className="text-2xl font-bold">Community Proposals</h1>

      {/* Proposals List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {proposals.length > 0 ? (
          proposals.map((p) => <ProposalCard key={p.id} proposal={p} />)
        ) : (
          <p>No proposals yet. Be the first to create one!</p>
        )}
      </div>
    </div>
  );
}
