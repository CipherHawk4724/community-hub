"use client";

import { useEffect, useState } from "react";
import { ethers, Interface, InterfaceAbi } from "ethers";
import ProposalCard from "../components/ProposalCard";
import WalletConnect from "../components/WalletConnect";

const CONTRACT_ADDRESS = "0x065Cc1814f7c840301fA1a32a1F8298308c0DB74";

import CommunityHubABI from "../abi/CommunityHub.json";

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

export default function HomePage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [account, setAccount] = useState<string>("");

const connectWallet = async () => {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();

    setProvider(provider);
    setSigner(signer);
    setAccount(address);

    // Pass ABI array directly
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      CommunityHubABI, // already an array
      signer
    );
    setContract(contract);
  } else {
    alert("Please install MetaMask!");
  }
};



  const fetchProposals = async () => {
    if (!contract) return;
    try {
      const list = await contract.listProposals(1, 100);
      const formatted: Proposal[] = list.map((p: any) => ({
        id: Number(p.id),
        creator: p.creator,
        beneficiary: p.beneficiary,
        description: p.description,
        votesYes: Number(p.votesYes),
        votesNo: Number(p.votesNo),
        donated: ethers.formatEther(p.donated),
        createdAt: Number(p.createdAt),
        open: p.open,
      }));
      setProposals(formatted);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (contract) fetchProposals();
  }, [contract]);

  return (
    <div className="min-h-screen bg-gray-100">
      <WalletConnect connectWallet={connectWallet} account={account} />

      <div className="max-w-5xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6 text-center">Community Hub</h1>

        {proposals.length === 0 ? (
          <p className="text-center text-gray-500">No proposals yet. Create one!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {proposals.map((proposal) => (
              <ProposalCard key={proposal.id} proposal={proposal} contract={contract} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
