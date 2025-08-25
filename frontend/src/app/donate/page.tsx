"use client";

import { useState } from "react";
import WalletConnect from "../../components/WalletConnect";

type Proposal = {
  id: number;
  description: string;
  donations: number;
};

export default function DonatePage() {
  const [proposals, setProposals] = useState<Proposal[]>([
    { id: 1, description: "Fund community clean water project", donations: 3 },
    { id: 2, description: "Support local coding bootcamp", donations: 5 },
    { id: 3, description: "Organize mental health awareness event", donations: 8 },
  ]);

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [amount, setAmount] = useState<string>("");

  const handleDonate = () => {
    if (!selectedId || !amount) {
      alert("Please select a proposal and enter an amount.");
      return;
    }

    const donationValue = parseFloat(amount);
    if (isNaN(donationValue) || donationValue <= 0) {
      alert("Enter a valid donation amount.");
      return;
    }

    // 🔗 Later: call smart contract donate(selectedId, { value: amount })
    setProposals((prev) =>
      prev.map((p) =>
        p.id === selectedId
          ? { ...p, donations: p.donations + donationValue }
          : p
      )
    );

    setAmount("");
    alert(`✅ Donated ${donationValue} SHM to Proposal #${selectedId}`);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Wallet Connection */}
      <div className="flex justify-end">
        <WalletConnect />
      </div>

      {/* Page Header */}
      <h1 className="text-2xl font-bold">Donate to Proposals</h1>

      {/* Proposal Selection */}
      <div className="space-y-3">
        {proposals.map((p) => (
          <label
            key={p.id}
            className={`flex items-center gap-3 border p-3 rounded-lg cursor-pointer ${
              selectedId === p.id ? "bg-blue-100 border-blue-400" : "bg-white"
            }`}
          >
            <input
              type="radio"
              name="proposal"
              value={p.id}
              checked={selectedId === p.id}
              onChange={() => setSelectedId(p.id)}
            />
            <div>
              <p className="font-medium">Proposal #{p.id}: {p.description}</p>
              <p className="text-sm text-gray-600">Total Donations: {p.donations} SHM</p>
            </div>
          </label>
        ))}
      </div>

      {/* Donation Input */}
      <div className="space-y-3">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount in SHM"
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleDonate}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          Donate
        </button>
      </div>
    </div>
  );
}
