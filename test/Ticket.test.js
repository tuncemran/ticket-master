const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const compiledFactory = require('../ethereum/build/TicketFactory.json');
const compiledTicket = require('../ethereum/build/Ticket.json');

let accounts;
let factory;
let ticketAddress;
let ticket;


beforeEach(async () => {
    accounts = await web3.eth.getAccounts();

    factory = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
        .deploy({data: compiledFactory.bytecode})
        .send({from: accounts[0], gas: '5000000'});

    await factory.methods.createTicket('Tunc Emran', 'https://facebook.com/tuncemran', 'Unit 1 ticket for NYE', 'Buy a ticket for NYE. Early entreee', '5').send({
        from: accounts[0],
        gas: '1000000'
    });

    const addresses = await factory.methods.getDeployedTickets().call();
    ticketAddress = addresses[0];
    ticket = await new web3.eth.Contract(
        JSON.parse(compiledTicket.interface),
        ticketAddress
    );

});

describe('Tickets', () => {
    it('should deploy a factory and a ticket', function () {
        assert.ok(factory.options.address);
        assert.ok(ticket.options.address);
    });

    it('should mark caller as the ticket owner', async function () {
        const owner = await ticket.methods.ticketOwner().call();
        assert.equal(owner, accounts[0]);
    });

    it('should allow people to send money and mark them as buyer', async function () {
        const buyer = accounts[1];

        // create a buying request
        await ticket.methods.createBuyingRequest().send({
            from: buyer,
            value: '100'
        })

        // check buyer
        const buyerAddress = await ticket.methods.buyer().call();
        assert.equal(buyer, buyerAddress);
    });

    it('should allow owner to approve the request', async function () {
        await ticket.methods.ownerApproveBuyingRequest().send({
            from: accounts[0],
            gas: '1000000'
        });

        const approvalStatus = await ticket.methods.approvalStatus().call();
        assert.equal(approvalStatus['ownerApproved'], true);
    });

    /*it('should allow buyer to approve the request', async function () {
        await ticket.methods.buyerApproveBuyingRequest().send({
            from: accounts[1],
            gas: '1000000'
        });

        const approvalStatus = await ticket.methods.approvalStatus().call();
        assert.equal(approvalStatus['buyerApproved'], true);
    });*/
})