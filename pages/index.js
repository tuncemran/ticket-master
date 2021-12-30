import React, {Component} from "react";
import web3 from "../ethereum/web3";
import factory from "../ethereum/factory";
import TicketContract from "../ethereum/ticket";

import 'semantic-ui-css/semantic.min.css';


import { Card } from 'semantic-ui-react';
import Navbar from "../components/navbarComponent/Navbar";
import LandingNotification from '../components/landingNotificationComponent/LandingNotification';

class Landing extends Component {

    static async getInitialProps() {
        const tickets = await factory.methods.getDeployedTickets().call();

        return {tickets};
    }

    state = {
        userAddress: []
    }

    async componentDidMount() {
        const account = await web3.eth.getAccounts();
        this.setState({userAddress: account});
    }

    getAllTickets = async () => {

        for (const ticketKey in this.props.tickets) {
            const ticketAddress = this.props.tickets[ticketKey];
            const theTicket = TicketContract(ticketAddress);

            const ownerName = await theTicket.methods.ownerName().call();
            const ownerFacebookAccount = await theTicket.methods.ownerFacebookAccount().call();
            const ticketTitle = await theTicket.methods.ticketTitle().call();
            const ticketDescription = await theTicket.methods.ticketDescription().call();
            const ticketPriceInDollars = await theTicket.methods.ticketPriceInDollars().call();
            const ticketStatus = await theTicket.methods.ticketStatus().call();
            const approvalStatus = await theTicket.methods.approvalStatus().call();

            const ticketObject = {
                ownerName,
                ownerFacebookAccount,
                ticketTitle,
                ticketDescription,
                ticketPriceInDollars,
                ticketStatus,
                approvalStatus
            }
            console.log(ticketObject)

        }
    }

    render() {
        return(
            <div>
                <Navbar />
                <LandingNotification userAddress={this.state.userAddress}/>

                <div>At ticket: {this.props.tickets}</div>
                <button onClick={this.getAllTickets}>lamxlka</button>
            </div>
        )
    }
}

export default Landing;