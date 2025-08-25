// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

contract CommunityHub {
    // -----------------------------
    // STRUCTS & STORAGE
    // -----------------------------
    struct Proposal {
        uint256 id;
        address creator;
        address payable beneficiary;
        string description;
        uint256 votesYes;
        uint256 votesNo;
        uint256 donated;    // total SHM donated
        uint256 createdAt;
        bool open;
    }

    uint256 public nextId; // auto-increment proposal ID
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    // -----------------------------
    // EVENTS
    // -----------------------------
    event ProposalCreated(
        uint256 indexed id,
        address indexed creator,
        address indexed beneficiary,
        string description
    );

    event Voted(
        uint256 indexed id,
        address indexed voter,
        bool support
    );

    event Donated(
        uint256 indexed id,
        address indexed from,
        uint256 amount
    );

    event Closed(uint256 indexed id);

    // -----------------------------
    // FUNCTIONS
    // -----------------------------

    // Create a new proposal
    function createProposal(string calldata description, address payable beneficiary)
        external
        returns (uint256)
    {
        require(bytes(description).length > 0, "Description required");
        require(beneficiary != address(0), "Beneficiary required");

        uint256 id = ++nextId;
        proposals[id] = Proposal({
            id: id,
            creator: msg.sender,
            beneficiary: beneficiary,
            description: description,
            votesYes: 0,
            votesNo: 0,
            donated: 0,
            createdAt: block.timestamp,
            open: true
        });

        emit ProposalCreated(id, msg.sender, beneficiary, description);
        return id;
    }

    // Vote on a proposal
    function vote(uint256 id, bool support) external {
        Proposal storage p = proposals[id];
        require(p.createdAt != 0, "Proposal does not exist");
        require(p.open, "Proposal closed");
        require(!hasVoted[id][msg.sender], "Already voted");

        hasVoted[id][msg.sender] = true;

        if (support) {
            p.votesYes += 1;
        } else {
            p.votesNo += 1;
        }

        emit Voted(id, msg.sender, support);
    }

    // Donate SHM to a proposal
    function donate(uint256 id) external payable {
        Proposal storage p = proposals[id];
        require(p.createdAt != 0, "Proposal does not exist");
        require(p.open, "Proposal closed");
        require(msg.value > 0, "Donation must be > 0");

        p.donated += msg.value;

        (bool ok, ) = p.beneficiary.call{value: msg.value}("");
        require(ok, "Transfer failed");

        emit Donated(id, msg.sender, msg.value);
    }

    // Close a proposal (only creator)
    function close(uint256 id) external {
        Proposal storage p = proposals[id];
        require(p.createdAt != 0, "Proposal does not exist");
        require(p.open, "Proposal already closed");
        require(msg.sender == p.creator, "Only creator can close");

        p.open = false;
        emit Closed(id);
    }

    // Get details of a single proposal
    function getProposal(uint256 id) external view returns (
        uint256, address, address, string memory, uint256, uint256, uint256, uint256, bool
    ) {
        Proposal storage p = proposals[id];
        require(p.createdAt != 0, "Proposal does not exist");

        return (
            p.id,
            p.creator,
            p.beneficiary,
            p.description,
            p.votesYes,
            p.votesNo,
            p.donated,
            p.createdAt,
            p.open
        );
    }

    // List proposals by range (for frontend pagination)
    function listProposals(uint256 fromId, uint256 toId) external view returns (Proposal[] memory) {
        require(toId >= fromId, "Invalid range");
        uint256 length = toId - fromId + 1;
        Proposal[] memory arr = new Proposal[](length);

        for (uint256 i = 0; i < length; i++) {
            arr[i] = proposals[fromId + i];
        }

        return arr;
    }
}
