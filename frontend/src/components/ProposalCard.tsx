"use client";

type Proposal = {
  id: number;
  description: string;
  votes: number;
  donations: number;
};

export default function ProposalCard({ proposal }: { proposal: Proposal }) {
  return (
    <div className="border rounded-xl p-4 shadow-md bg-white">
      <h2 className="text-lg font-semibold mb-2">Proposal #{proposal.id}</h2>
      <p className="mb-2">{proposal.description}</p>
      <p className="text-sm">Votes: {proposal.votes}</p>
      <p className="text-sm">Donations: {proposal.donations} SHM</p>
    </div>
  );
}
