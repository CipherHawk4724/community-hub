// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract CommunityHub {
    struct Proposal {
        uint id;
        string title;
        string description;
        address creator;
        uint fundsRaised;
        uint votesFor;
        uint votesAgainst;
        uint deadline;
        bool executed;
    }

    uint public proposalCount;
    mapping(uint => Proposal) public proposals;
    mapping(uint => mapping(address => bool)) public voted;

    event ProposalCreated(uint id, string title, address creator);
    event VoteCast(uint proposalId, address voter, bool support);
    event DonationReceived(uint proposalId, address donor, uint amount);

    function createProposal(string memory _title, string memory _desc, uint _duration) external {
        proposalCount++;
        proposals[proposalCount] = Proposal({
            id: proposalCount,
            title: _title,
            description: _desc,
            creator: msg.sender,
            fundsRaised: 0,
            votesFor: 0,
            votesAgainst: 0,
            deadline: block.timestamp + _duration,
            executed: false
        });
        emit ProposalCreated(proposalCount, _title, msg.sender);
    }

    function vote(uint _id, bool _support) external {
        require(!voted[_id][msg.sender], "Already voted");
        Proposal storage prop = proposals[_id];
        require(block.timestamp < prop.deadline, "Voting ended");
        voted[_id][msg.sender] = true;
        if(_support) prop.votesFor++;
        else prop.votesAgainst++;
        emit VoteCast(_id, msg.sender, _support);
    }

    function donate(uint _id) external payable {
        Proposal storage prop = proposals[_id];
        prop.fundsRaised += msg.value;
        emit DonationReceived(_id, msg.sender, msg.value);
    }
}
