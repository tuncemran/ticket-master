import React, {Component} from "react";
import web3 from "../ethereum/web3";
import factory from "../ethereum/factory";
import TicketContract from "../ethereum/ticket";

import 'semantic-ui-css/semantic.min.css';


import { Card } from 'semantic-ui-react';
import Navbar from "../components/navbarComponent/Navbar";
import LandingNotification from '../components/landingNotificationComponent/LandingNotification';
import TicketComponent from '../components/ticketComponent/TicketComponent';

class Landing extends Component {

    static async getInitialProps() {
        const tickets = await factory.methods.getDeployedTickets().call();
        return {tickets};
    }

    state = {
        userAddress: [],
        allTickets: []
    }

    async componentDidMount() {
        const account = await web3.eth.getAccounts();
        const allTickets = await this.getAllTickets();
        this.setState({userAddress: account, allTickets});
    }

    getAllTickets = async () => {
        const allTickets = [];
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
            /*console.log(ticketObject)*/
            allTickets.push(ticketObject);
        }
        return allTickets;
    }

    renderTickets() {
        return this.state.allTickets.map((ticket, key) => {
            if (ticket.ticketStatus[3] === true) {
                return(
                    <TicketComponent
                        key={key}
                        ownerName={ticket.ownerName}
                        ownerFacebookAccount={ticket.ownerFacebookAccount}
                        ticketTitle={ticket.ticketTitle}
                        ticketDescription={ticket.ticketDescription}
                        ticketPriceInDollars={ticket.ticketPriceInDollars}
                    />
                )
            }
        });
    }

    render() {
        console.log(this.state.allTickets)
        return(
            <div>
                <Navbar />
                <LandingNotification userAddress={this.state.userAddress}/>
                <div style={{margin: "auto", marginTop: 40, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gridGap: 20, width: "70%"}}>
                    {this.renderTickets()}
                </div>

            </div>
        )
    }
}

export default Landing;