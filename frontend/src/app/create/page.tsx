"use client";

import { useState } from "react";
import { ethers } from "ethers";
import WalletConnect from "../../components/WalletConnect";
import CommunityHubABI from "../../abi/CommunityHub.json";

const CONTRACT_ADDRESS = "0x065Cc1814f7c840301fA1a32a1F8298308c0DB74";
const BANKAI_CHAIN_ID = "0x1F40"; // 9090 in hex

export default function CreateProposalPage() {
  const [description, setDescription] = useState("");
  const [beneficiary, setBeneficiary] = useState("");
  const [account, setAccount] = useState<string>("");
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [loading, setLoading] = useState(false);

  // Add Bankai Testnet if missing
  // Add Shardeum network if missing
  const addShardeumNetwork = async () => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: BANKAI_CHAIN_ID,
            chainName: "Shardeum Liberty 1.X",
            rpcUrls: ["https://api-unstable.shardeum.org/"],
            nativeCurrency: { name: "Shardeum", symbol: "SHM", decimals: 18 },
            blockExplorerUrls: ["https://explorer-unstable.shardeum.org/"],
          },
        ],
      });
      console.log("Shardeum network added successfully!");
    } catch (error) {
      console.error("Failed to add Shardeum network:", error);
    }
  };

  // Switch to Bankai Testnet
  const switchToBankai = async () => {
    if (!window.ethereum) return;
    try {
      const currentChainId = await window.ethereum.request({ method: "eth_chainId" });
      if (currentChainId === BANKAI_CHAIN_ID) return; // Already on Bankai
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: BANKAI_CHAIN_ID }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        // Chain not added
        await addShardeumNetwork();
        await switchToBankai(); // try switching again
      } else {
        console.error("Failed to switch network. Make sure Bankai is added in MetaMask.", switchError);
      }
    }
  };

  // Connect wallet
  const connectWallet = async () => {
    if (!window.ethereum) return alert("Please install MetaMask!");
    await switchToBankai();

    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    setAccount(address);

    const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, CommunityHubABI, signer);
    setContract(contractInstance);
  };

  // Create proposal
  const handleCreateProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contract) return alert("Connect your wallet first!");
    if (!description || !beneficiary) return alert("Please fill all fields!");

    try {
      setLoading(true);
      const tx = await contract.createProposal(description, beneficiary);
      await tx.wait();
      alert("Proposal created successfully!");
      setDescription("");
      setBeneficiary("");
    } catch (err) {
      console.error(err);
      alert("Failed to create proposal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-4">
      <WalletConnect connectWallet={connectWallet} account={account} />

      <div className="w-full max-w-lg bg-white p-8 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Create a Proposal</h2>

        <form onSubmit={handleCreateProposal} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2"
              placeholder="Describe your proposal..."
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Beneficiary Address</label>
            <input
              type="text"
              value={beneficiary}
              onChange={(e) => setBeneficiary(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2"
              placeholder="0x..."
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 transition"
          >
            {loading ? "Creating..." : "Create Proposal"}
          </button>
        </form>
      </div>
    </div>
  );
}
