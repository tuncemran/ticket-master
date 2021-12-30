pragma solidity ^0.4.17;

contract TicketFactory {
    address[] public deployedTickets;

    function createTicket(string OwnerName, string OwnerFacebookAccount, string TicketTitle, string TicketDescription, string TicketPriceInDollars) public {
        address newTicket = new Ticket(OwnerName, OwnerFacebookAccount, TicketTitle, TicketDescription, TicketPriceInDollars, msg.sender);
        deployedTickets.push(newTicket);
    }

    function getDeployedTickets() public view returns (address[]) {
        return (deployedTickets);
    }
}


contract Ticket {
    struct TicketStatus {
        bool isDeleted;
        bool isPending;
        bool isCompleted;
        bool isActive;
    }

    struct ApprovalStatus {
        bool buyerApproved;
        bool ownerApproved;
    }

    //ticket image is stored on Firebase
    address public ticketOwner;
    string public ownerName;
    string public ownerFacebookAccount;
    string public ticketTitle;
    string public ticketDescription;
    string public ticketPriceInDollars;
    TicketStatus public ticketStatus;
    ApprovalStatus public approvalStatus;

    address public buyer;


    function Ticket(string OwnerName, string OwnerFacebookAccount, string TicketTitle, string TicketDescription, string TicketPriceInDollars, address TicketOwner) public {
        ticketOwner = TicketOwner;
        ownerName = OwnerName;
        ownerFacebookAccount = OwnerFacebookAccount;
        ticketTitle = TicketTitle;
        ticketDescription = TicketDescription;
        ticketPriceInDollars = TicketPriceInDollars;
        ticketStatus = TicketStatus({
        isDeleted: false,
        isPending: false,
        isCompleted: false,
        isActive: true
        });
        approvalStatus = ApprovalStatus({
        ownerApproved: false,
        buyerApproved: false
        });
    }

    modifier restricted() {
        require(msg.sender == ticketOwner);
        _;
    }

    modifier shouldNotBeDeletedOrCompletedTicket() {
        require(!ticketStatus.isDeleted);
        require(!ticketStatus.isCompleted);
        _;
    }

    function getContractBalance() public view returns (uint) {
        return address(this).balance;
    }

    function deleteContract() public restricted shouldNotBeDeletedOrCompletedTicket {
        if (address(this).balance != 0) {
            // if money involved, give the money back
            buyer.transfer(address(this).balance);
        }

        ticketStatus = TicketStatus({
        isDeleted: true,
        isPending: false,
        isCompleted: false,
        isActive: false
        });
    }

    // BUYING REQUESTS

    function createBuyingRequest() public shouldNotBeDeletedOrCompletedTicket payable{
        require(!ticketStatus.isPending);
        buyer = msg.sender;
        ticketStatus = TicketStatus({
        isDeleted: false,
        isPending: true,
        isCompleted: false,
        isActive: false
        });
    }

    function rejectBuyingRequest() public restricted shouldNotBeDeletedOrCompletedTicket {
        ticketStatus = TicketStatus({
        isDeleted: false,
        isPending: false,
        isCompleted: false,
        isActive: true
        });

        approvalStatus = ApprovalStatus({
        ownerApproved: false,
        buyerApproved: false
        });

        // transfer balance back
        buyer.transfer(address(this).balance);
    }

    function ownerApproveBuyingRequest() public restricted shouldNotBeDeletedOrCompletedTicket {

        approvalStatus = ApprovalStatus({
        ownerApproved: true,
        buyerApproved: approvalStatus.buyerApproved
        });

        if (approvalStatus.ownerApproved && approvalStatus.buyerApproved) {
            // complete transaction
            ticketStatus = TicketStatus({
            isDeleted: false,
            isPending: false,
            isCompleted: true,
            isActive: false
            });
            ticketOwner.transfer(address(this).balance);
        }
        else {
            ticketStatus = TicketStatus({
            isDeleted: false,
            isPending: true,
            isCompleted: false,
            isActive: false
            });
        }
    }

    function buyerApproveBuyingRequest() public shouldNotBeDeletedOrCompletedTicket {
        require(buyer == msg.sender);
        approvalStatus = ApprovalStatus({
        ownerApproved: approvalStatus.ownerApproved,
        buyerApproved: true
        });

        if (approvalStatus.ownerApproved && approvalStatus.buyerApproved) {
            // complete transaction
            ticketStatus = TicketStatus({
            isDeleted: false,
            isPending: false,
            isCompleted: true,
            isActive: false
            });
            ticketOwner.transfer(address(this).balance);
        }
        else {
            ticketStatus = TicketStatus({
            isDeleted: false,
            isPending: true,
            isCompleted: false,
            isActive: false
            });
        }
    }
}