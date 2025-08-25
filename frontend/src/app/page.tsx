"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import CommunityHubAbi from "abi/CommunityHub.json";

const CONTRACT_ADDRESS = "0x065Cc1814f7c840301fA1a32a1F8298308c0DB74";

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

export default function Home() {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [description, setDescription] = useState("");
  const [beneficiary, setBeneficiary] = useState("");

  // Connect MetaMask wallet
  const connectWallet = async () => {
    if ((window as any).ethereum) {
      const ethProvider = new ethers.BrowserProvider((window as any).ethereum);
      await ethProvider.send("eth_requestAccounts", []);
      setProvider(ethProvider);
      const signer = await ethProvider.getSigner();
      setSigner(signer);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CommunityHubAbi, signer);
      setContract(contract);
    } else {
      alert("Please install MetaMask!");
    }
  };

  // Fetch proposals using listProposals
  const fetchProposals = async () => {
    if (!contract) return;
    try {
      // Fetch proposals 1-20 for example
      const proposalsData = await contract.listProposals(1, 20);
      const temp: Proposal[] = proposalsData.map((p: any) => ({
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
      setProposals(temp.reverse());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (contract) fetchProposals();
  }, [contract]);

  // Create new proposal
  const createProposal = async () => {
    if (!contract || !description || !beneficiary) return;
    try {
      const tx = await contract.createProposal(description, beneficiary);
      await tx.wait();
      setDescription("");
      setBeneficiary("");
      fetchProposals();
    } catch (err) {
      console.error(err);
    }
  };

  // Vote for a proposal
  const vote = async (id: number, support: boolean) => {
    if (!contract) return;
    try {
      const tx = await contract.vote(id, support);
      await tx.wait();
      fetchProposals();
    } catch (err) {
      console.error(err);
    }
  };

  // Donate SHM tokens
  const donate = async (id: number, amount: string) => {
    if (!contract || !amount) return;
    try {
      const tx = await contract.donate(id, { value: ethers.parseEther(amount) });
      await tx.wait();
      fetchProposals();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-4">Decentralized Community Hub</h1>

      {!provider ? (
        <button
          onClick={connectWallet}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Connect Wallet
        </button>
      ) : (
        <div>
          {/* Create Proposal */}
          <div className="bg-white p-4 rounded shadow mb-6">
            <h2 className="text-xl font-semibold mb-2">Create Proposal</h2>
            <input
              type="text"
              placeholder="Description"
              className="border p-2 w-full mb-2 rounded"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <input
              type="text"
              placeholder="Beneficiary Address"
              className="border p-2 w-full mb-2 rounded"
              value={beneficiary}
              onChange={(e) => setBeneficiary(e.target.value)}
            />
            <button
              onClick={createProposal}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Submit
            </button>
          </div>

          {/* List Proposals */}
          <div className="space-y-4">
            {proposals.map((p) => (
              <div key={p.id} className="bg-white p-4 rounded shadow">
                <h3 className="font-semibold">{p.description}</h3>
                <p>Creator: {p.creator}</p>
                <p>Beneficiary: {p.beneficiary}</p>
                <p>Votes: ✅ {p.votesYes} | ❌ {p.votesNo}</p>
                <p>Donated: {p.donated} SHM</p>
                <div className="flex space-x-2 mt-2">
                  {p.open ? (
                    <>
                      <button
                        onClick={() => vote(p.id, true)}
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                      >
                        Vote Yes
                      </button>
                      <button
                        onClick={() => vote(p.id, false)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      >
                        Vote No
                      </button>
                      <input
                        type="text"
                        placeholder="Amount (SHM)"
                        className="border p-1 rounded w-24"
                        id={`donate-${p.id}`}
                      />
                      <button
                        onClick={() => {
                          const input = document.getElementById(
                            `donate-${p.id}`
                          ) as HTMLInputElement;
                          donate(p.id, input.value);
                        }}
                        className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                      >
                        Donate
                      </button>
                    </>
                  ) : (
                    <span className="text-gray-500">Closed</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
