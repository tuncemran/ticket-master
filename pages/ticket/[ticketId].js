import React, {Component} from 'react';
import web3 from "../../ethereum/web3";
import TicketContract from "../../ethereum/ticket";
import factory from "../../ethereum/factory";

import {Card, Image, Icon, Button, Dimmer, Loader} from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import Navbar from '../../components/navbarComponent/Navbar';
import {Router} from '../../routes';
import { withRouter } from 'next/router'

export const getStaticPaths = async () => {
    const tickets = await factory.methods.getDeployedTickets().call();
    const paths = tickets.map(ticket => {
        return {
            params: {ticketId: ticket.toString()}
        }
    })

    return {
        paths,
        fallback: 'blocking'
    }
}

export const getStaticProps = async (context) => {
    return {props: {}}
}

class TicketPage extends Component {


    state = {
        userAddress: [],
        ticketObject:{},
        ticketAddress: '',
        dollarRate: 0,
        currentTicket: null,
        isLoaderActive: false
    }

    async LifeCycleGetter() {
        const ticketAddress = this.props.router.asPath.replace('/ticket/', '');

        const theTicket = TicketContract(web3.utils.toChecksumAddress(ticketAddress));
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
            ticketAddress
        }

        const dollarRate = await fetch('https://min-api.cryptocompare.com/data/price?fsym=BTC&tsyms=USD,JPY,EUR&api_key=d959d81cd1dccd2ebfc13ee40ed8fade13ee19aa51ee6e49d40cdf3748ba6aec')
            .then(response => response.json())
            .then(data => {
                return(data['USD'])
            });

        this.setState({ticketObject, ticketAddress, dollarRate, currentTicket: theTicket})
    }

    async UNSAFE_componentWillMount() {
        await this.LifeCycleGetter();
    }

    async componentDidMount() {
        const account = await web3.eth.getAccounts();
        this.setState({userAddress: account[0]})
    }


    getTicketStatus = () => {
        if (this.state.ticketObject.ticketStatus === undefined) return null;

        if (this.state.ticketObject.ticketStatus[0] === true) return(<span style={{color: "red"}}>Deleted</span>)

        if (this.state.ticketObject.ticketStatus[1] === true) return(<span style={{color: "yellow"}}>Deleted</span>)

        if (this.state.ticketObject.ticketStatus[2] === true) return(<span style={{color: "green"}}>Completed</span>)

        if (this.state.ticketObject.ticketStatus[3] === true) return(<span style={{color: "blue"}}>Active</span>)

    }

    getApprovalStatus = () => {
        if (this.state.ticketObject.approvalStatus === undefined) return null;

        if (this.state.ticketObject.approvalStatus[0] === true && this.state.ticketObject.approvalStatus[1] === true) return(<span style={{color: "green"}}>Approved</span>)

        if (this.state.ticketObject.approvalStatus[0] === false && this.state.ticketObject.approvalStatus[1] === false) return(<span style={{color: "red"}}>Not Approved</span>)

        if (this.state.ticketObject.approvalStatus[0] === true) return(<span style={{color: "yellow"}}>Owner Approved</span>)

        if (this.state.ticketObject.approvalStatus[1] === true) return(<span style={{color: "yellow"}}>Buyer Approved</span>)
    }

    onSubmitDelete = async () => {

        // set loader on
        this.setState({isLoaderActive: true});

        // function
        await this.state.currentTicket.methods.deleteContract().send({
            from: web3.utils.toChecksumAddress(this.state.userAddress),
            gas: '1000000'
        });
        // refresh state
        await this.LifeCycleGetter();

        // set loader off
        this.setState({isLoaderActive: false});
    }

    onSubmitReject = async () => {

        // set loader on
        this.setState({isLoaderActive: true});

        // function
        await this.state.currentTicket.methods.rejectBuyingRequest().send({
            from: web3.utils.toChecksumAddress(this.state.userAddress),
            gas: '1000000'
        });
        // refresh state
        await this.LifeCycleGetter();

        // set loader off
        this.setState({isLoaderActive: false});
    }

    onSubmitApproveOwner = async () => {

        // set loader on
        this.setState({isLoaderActive: true});

        // function
        await this.state.currentTicket.methods.ownerApproveBuyingRequest().send({
            from: web3.utils.toChecksumAddress(this.state.userAddress),
            gas: '1000000'
        });
        // refresh state
        await this.LifeCycleGetter();

        // set loader off
        this.setState({isLoaderActive: false});
    }
    onSubmitApproveBuyer = async () => {

        // set loader on
        this.setState({isLoaderActive: true});

        // function
        await this.state.currentTicket.methods.buyerApproveBuyingRequest().send({
            from: web3.utils.toChecksumAddress(this.state.userAddress),
            gas: '1000000'
        });
        // refresh state
        await this.LifeCycleGetter();

        // set loader off
        this.setState({isLoaderActive: false});
    }

      onSubmitCreate = async () => {

          // set loader on
          this.setState({isLoaderActive: true});

          // function
          await this.state.currentTicket.methods.createBuyingRequest().send({
              from: web3.utils.toChecksumAddress(this.state.userAddress),
              value: web3.utils.toWei(((parseFloat(this.state.ticketObject.ticketPriceInDollars) / this.state.dollarRate).toFixed(4)).toString(), 'ether')
          })
          // refresh state
          await this.LifeCycleGetter();

          // set loader off
          this.setState({isLoaderActive: false});

      }

    ticketComponent() {
        if (this.state.userAddress === this.state.ticketObject.ticketOwner) {
            // owner
            return(this.ticketOwnerComponent());
        }else {
            return(this.ticketBuyerComponent());
        }
    }

    ticketOwnerComponent() {
        const currentTicket = this.state.ticketObject;
        if (currentTicket === {}) return null;

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
                        <Button onClick={this.onSubmitDelete}>Delete</Button>
                        <Button onClick={this.onSubmitReject}>Reject request</Button>
                        <Button onClick={this.onSubmitApproveOwner}>Approve Request</Button>
                    </Button.Group>
                </div>
                <div style={{ marginLeft: 35, alignSelf: 'center'}}>
                    <h4>Ticket status: {this.getTicketStatus(currentTicket.ticketStatus)}</h4>
                    <br />
                    <h4>Approval status: {this.getApprovalStatus(currentTicket.approvalStatus)} </h4>
                </div>
            </div>

        )
    }

    ticketBuyerComponent() {
        const currentTicket = this.state.ticketObject;
        if (currentTicket === {}) return null;
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
                        <Button onClick={this.onSubmitCreate}>Create</Button>
                        <Button onClick={this.onSubmitApproveBuyer}>Approve Request</Button>
                    </Button.Group>
                </div>
                <div style={{ marginLeft: 35, alignSelf: 'center'}}>
                    <h4>Ticket status: {this.getTicketStatus(currentTicket.ticketStatus)}</h4>
                    <br />
                    <h4>Approval status: {this.getApprovalStatus(currentTicket.approvalStatus)} </h4>
                </div>
            </div>
        )
    }

    render() {
        return(
            <div>
                <Navbar />
                {this.state.isLoaderActive ?
                    <Dimmer active inverted>
                        <Loader size='large'>Blockchain needs to confirm this transaction to make this experience safe for everyone! <br /> <br /> This usually takes 10-15 seconds. At the meantime please wait and do not refresh the website please...</Loader>
                    </Dimmer> : null
                }

                <Card className={'landing-notification-container'}>
                    <Card.Content>
                        <Card.Header style={{color: "#030e22"}}>Ticket Details</Card.Header>
                    </Card.Content>
                    <Card.Content>
                        <div>The address of this ticket is  {this.state.ticketAddress}. Do not lose this! As you will not be able to find it in the main page once some one creates a buying request. </div>
                        <br />
                    </Card.Content>
                </Card>
                {this.ticketComponent()}

            </div>
        )
    }
}

export default withRouter(TicketPage);
