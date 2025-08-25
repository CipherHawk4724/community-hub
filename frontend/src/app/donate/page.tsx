"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import WalletConnect from "../../components/WalletConnect";
import ProposalCard from "../../components/ProposalCard";

const CONTRACT_ADDRESS = "0x065Cc1814f7c840301fA1a32a1F8298308c0DB74";
const SHARDEUM_CHAIN_ID = "0x1F40"; // 8080 in hex

import CommunityHubABI from "../../abi/CommunityHub.json";

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

export default function DonatePage() {
  const [account, setAccount] = useState<string>("");
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [amount, setAmount] = useState<string>("0");
  const [loading, setLoading] = useState(false);

  const addShardeumNetwork = async () => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: SHARDEUM_CHAIN_ID,
            chainName: "Shardeum Unstablenet",
            rpcUrls: ["https://api-unstable.shardeum.org"],
            nativeCurrency: { name: "SHM", symbol: "SHM", decimals: 18 },
            blockExplorerUrls: ["https://explorer-unstable.shardeum.org/"],
          },
        ],
      });
    } catch (error) {
      console.error(error);
    }
  };

  const switchToShardeum = async () => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: SHARDEUM_CHAIN_ID }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        await addShardeumNetwork();
      } else {
        console.error(switchError);
      }
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) return alert("Install MetaMask!");
    await switchToShardeum();

    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    setAccount(address);

    const contractInstance = new ethers.Contract(
      CONTRACT_ADDRESS,
      CommunityHubABI,
      signer
    );
    setContract(contractInstance);
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

  const handleDonate = async (id: number) => {
    if (!contract) return;
    try {
      setLoading(true);
      const tx = await contract.donate(id, { value: ethers.parseEther(amount) });
      await tx.wait();
      alert("Donation successful!");
      setAmount("0");
      fetchProposals();
    } catch (err) {
      console.error(err);
      alert("Donation failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <WalletConnect connectWallet={connectWallet} account={account} />

      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Donate to Proposals</h1>

        {proposals.length === 0 ? (
          <p className="text-center text-gray-500">No proposals available for donation.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {proposals.map((proposal) => (
              <div key={proposal.id}>
                <ProposalCard proposal={proposal} contract={contract} />
                <div className="flex mt-2 gap-2">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="ETH amount"
                    className="flex-1 border border-gray-300 rounded-md p-2"
                  />
                  <button
                    onClick={() => handleDonate(proposal.id)}
                    disabled={loading || !amount || Number(amount) <= 0}
                    className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
                  >
                    {loading ? "Processing..." : "Donate"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
