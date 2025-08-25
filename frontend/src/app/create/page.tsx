"use client";

import { useState } from "react";
import WalletConnect from "../../components/WalletConnect";

export default function CreateProposalPage() {
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim()) {
      alert("Please enter a proposal description.");
      return;
    }

    // 🔗 Later: call smart contract function createProposal(description)
    console.log("New proposal created:", description);

    setSubmitted(true);
    setDescription("");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Wallet Connection */}
      <div className="flex justify-end">
        <WalletConnect />
      </div>

      {/* Page Header */}
      <h1 className="text-2xl font-bold">Create a New Proposal</h1>

      {/* Proposal Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter your proposal description..."
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={4}
        />
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Submit Proposal
        </button>
      </form>

      {/* Confirmation Message */}
      {submitted && (
        <p className="text-green-600 font-medium">
          ✅ Proposal submitted successfully (not yet saved to blockchain).
        </p>
      )}
    </div>
  );
}
