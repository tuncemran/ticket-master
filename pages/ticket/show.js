import React, {useState, useEffect} from 'react';
import { useRouter } from 'next/router';
import web3 from "../../ethereum/web3";
import TicketContract from "../../ethereum/ticket";

import {Card, Image, Icon, Button} from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import Navbar from '../../components/navbarComponent/Navbar';


const Ticket = () => {

    const router = useRouter()
    const slug = [router.asPath.replace('/ticket/','')]
    const [currentTicket, setTicket] = useState(null);
    const [accountAddress, setAccountAddress] = useState(null);
    const [state, setState] = useState(false);
    const [dollar, setDollar] = useState(0);
    const [priceEther, settPriceEther] = useState(0);

    const onSubmitDelete = async () => {
        const theTicket = TicketContract(web3.utils.toChecksumAddress(slug[0]));

        await theTicket.methods.deleteContract().send({
            from: accountAddress,
            gas: '1000000'
        });
        // refresh state
        setState(true);
    }

    const onSubmitReject = async () => {
        const theTicket = TicketContract(web3.utils.toChecksumAddress(slug[0]));

        await theTicket.methods.rejectBuyingRequest().send({
            from: accountAddress,
            gas: '1000000'
        });
        // refresh state
        setState(true);
    }

    const onSubmitApproveOwner = async () => {
        const theTicket = TicketContract(web3.utils.toChecksumAddress(slug[0]));

        await theTicket.methods.ownerApproveBuyingRequest().send({
            from: accountAddress,
            gas: '1000000'
        });
        // refresh state
        setState(true);
    }
    const onSubmitApproveBuyer = async () => {
        const theTicket = TicketContract(web3.utils.toChecksumAddress(slug[0]));

        await theTicket.methods.buyerApproveBuyingRequest().send({
            from: accountAddress,
            gas: '1000000'
        });
        // refresh state
        setState(true);
    }

    const onSubmitCreate = async () => {
        const theTicket = TicketContract(web3.utils.toChecksumAddress(slug[0]));

        await theTicket.methods.createBuyingRequest().send({
            from: buyer,
            value: web3.utils.toWei(priceEther.toString(), 'ether')
        })
        // refresh state
        setState(true);

    }

    useEffect(async () => {
        if (state) {
            try{

                const theTicket = TicketContract(web3.utils.toChecksumAddress(slug[0]));
                const ticketOwner = await theTicket.methods.ticketOwner().call();
                const ownerName = await theTicket.methods.ownerName().call();
                const ownerFacebookAccount = await theTicket.methods.ownerFacebookAccount().call();
                const ticketTitle = await theTicket.methods.ticketTitle().call();
                const ticketDescription = await theTicket.methods.ticketDescription().call();
                const ticketPriceInDollars = await theTicket.methods.ticketPriceInDollars().call();
                const ticketStatus = await theTicket.methods.ticketStatus().call();
                const approvalStatus = await theTicket.methods.approvalStatus().call();

                const ticketObject = {
                    ownerName,
                    ticketOwner,
                    ownerFacebookAccount,
                    ticketTitle,
                    ticketDescription,
                    ticketPriceInDollars,
                    ticketStatus,
                    approvalStatus,
                    ticketAddress: slug[0]
                }
                setTicket(ticketObject);
            }catch (e) {
                console.log(e)
            }

            setState(false);
        }
    }, [state])

    useEffect(async () => {
        try{
            if (slug !== [] || slug !== undefined){
                const theTicket = TicketContract(web3.utils.toChecksumAddress(slug[0]));
                const ticketOwner = await theTicket.methods.ticketOwner().call();
                const ownerName = await theTicket.methods.ownerName().call();
                const ownerFacebookAccount = await theTicket.methods.ownerFacebookAccount().call();
                const ticketTitle = await theTicket.methods.ticketTitle().call();
                const ticketDescription = await theTicket.methods.ticketDescription().call();
                const ticketPriceInDollars = await theTicket.methods.ticketPriceInDollars().call();
                const ticketStatus = await theTicket.methods.ticketStatus().call();
                const approvalStatus = await theTicket.methods.approvalStatus().call();

                const ticketObject = {
                    ownerName,
                    ticketOwner,
                    ownerFacebookAccount,
                    ticketTitle,
                    ticketDescription,
                    ticketPriceInDollars,
                    ticketStatus,
                    approvalStatus,
                    ticketAddress: slug[0]
                }
                setTicket(ticketObject);
            }else{
                console.log("waiting or not found")
            }

        }catch (e) {
            console.log(e)
        }

    }, [slug])


    useEffect(async () => {
        const account = await web3.eth.getAccounts();
        if (account.length > 0) {
            setAccountAddress(account[0]);
        }
        await fetch('https://min-api.cryptocompare.com/data/price?fsym=BTC&tsyms=USD,JPY,EUR&api_key=d959d81cd1dccd2ebfc13ee40ed8fade13ee19aa51ee6e49d40cdf3748ba6aec')
            .then(response => response.json())
            .then(data => {
                setDollar(data['USD'])
            });
    }, [])

    useEffect(async () => {
        try {
            const theTicket = TicketContract(web3.utils.toChecksumAddress(slug[0]));
            const price = parseFloat(await theTicket.methods.ticketPriceInDollars().call())
            const etherPrice = isNaN(price) ? 0.001 : price / dollar;
            settPriceEther(etherPrice);
        }catch (e) {

        }



    }, [dollar,currentTicket])

    const getTicketStatus = (ticketStatus) => {
        if (ticketStatus[0] === true) return(<span style={{color: "red"}}>Deleted</span>)

        if (ticketStatus[1] === true) return(<span style={{color: "yellow"}}>Deleted</span>)

        if (ticketStatus[2] === true) return(<span style={{color: "green"}}>Completed</span>)

        if (ticketStatus[3] === true) return(<span style={{color: "blue"}}>Active</span>)

    }

    const getApprovalStatus = (approvalStatus) => {
        if (approvalStatus[0] === true && approvalStatus[1] === true) return(<span style={{color: "green"}}>Approved</span>)

        if (approvalStatus[0] === false && approvalStatus[1] === false) return(<span style={{color: "red"}}>Not Approved</span>)

        if (approvalStatus[0] === true) return(<span style={{color: "yellow"}}>Owner Approved</span>)

        if (approvalStatus[1] === true) return(<span style={{color: "yellow"}}>Buyer Approved</span>)
    }

    const ticketComponent = () => {

        if (currentTicket && accountAddress === currentTicket.ticketOwner) {
            // owner
            return(ticketOwnerComponent());
        }else {
            return(ticketBuyerComponent());
        }
    }

    const ticketOwnerComponent = () => {
        if (currentTicket === null) return null;
        return(
            <div style={{display: 'flex', justifyContent: 'center', flexDirection: 'row', marginTop: 40}}>
                <Card style={{margin: 0, float: "left", width: "30%", marginTop: 0}}>
                    <Image src='https://react.semantic-ui.com/images/avatar/large/matthew.png' wrapped ui={false} />
                    <Card.Content>
                        <Card.Header>{currentTicket.ticketTitle}</Card.Header>
                        <Card.Meta>
                            <span className='date'>{currentTicket.ownerName} - <a href={currentTicket.ownerFacebookAccount}>Check Me On Facebook</a></span>
                        </Card.Meta>
                        <Card.Description>
                            {currentTicket.ticketDescription}
                        </Card.Description>
                    </Card.Content>
                    <Card.Content extra>
                        <a>
                            <Icon name='dollar' />
                            {currentTicket.ticketPriceInDollars}
                        </a>
                    </Card.Content>
                </Card>
                <div style={{ width: 150}}>
                    <Button.Group basic vertical style={{width: "100%", height: "100%"}}>
                        <Button onClick={onSubmitDelete}>Delete</Button>
                        <Button onClick={onSubmitReject}>Reject request</Button>
                        <Button onClick={onSubmitApproveOwner}>Approve Request</Button>
                    </Button.Group>
                </div>
                <div style={{ marginLeft: 35, alignSelf: 'center'}}>
                    <h4>Ticket status: {getTicketStatus(currentTicket.ticketStatus)}</h4>
                    <br />
                    <h4>Approval status: {getApprovalStatus(currentTicket.approvalStatus)} </h4>
                </div>
            </div>

        )
    }

    const ticketBuyerComponent = () => {
        if (currentTicket === null) return null;
        return(
            <div style={{display: 'flex', justifyContent: 'center', flexDirection: 'row', marginTop: 40}}>
                <Card style={{margin: 0, float: "left", width: "30%", marginTop: 0}}>
                    <Image src='https://react.semantic-ui.com/images/avatar/large/matthew.png' wrapped ui={false} />
                    <Card.Content>
                        <Card.Header>{currentTicket.ticketTitle}</Card.Header>
                        <Card.Meta>
                            <span className='date'>{currentTicket.ownerName} - <a href={currentTicket.ownerFacebookAccount}>Check Me On Facebook</a></span>
                        </Card.Meta>
                        <Card.Description>
                            {currentTicket.ticketDescription}
                        </Card.Description>
                    </Card.Content>
                    <Card.Content extra>
                        <a>
                            <Icon name='dollar' />
                            {currentTicket.ticketPriceInDollars}
                        </a>
                    </Card.Content>
                </Card>
                <div style={{ width: 150}}>
                    <Button.Group basic vertical style={{width: "100%", height: "100%"}}>
                        <Button onClick={onSubmitCreate}>Create</Button>
                        <Button onClick={onSubmitApproveBuyer}>Approve Request</Button>
                    </Button.Group>
                </div>
                <div style={{ marginLeft: 35, alignSelf: 'center'}}>
                    <h4>Ticket status: {getTicketStatus(currentTicket.ticketStatus)}</h4>
                    <br />
                    <h4>Approval status: {getApprovalStatus(currentTicket.approvalStatus)} </h4>
                </div>
            </div>
        )
    }



    return (
        <div>
            <Navbar />
            <Card className={'landing-notification-container'}>
                <Card.Content>
                    <Card.Header style={{color: "#030e22"}}>Ticket Details</Card.Header>
                </Card.Content>
                <Card.Content>
                    <div>The address of this ticket is  {slug[0]}. Do not lose this! As you will not be able to find it in the main page once some one creates a buying request. </div>
                    <br />
                </Card.Content>
            </Card>
            {ticketComponent()}

        </div>
    )
}

export default Ticket