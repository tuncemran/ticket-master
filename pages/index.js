import React, {Component} from "react";
import web3 from "../ethereum/web3";
import factory from "../ethereum/factory";
import TicketContract from "../ethereum/ticket";

import 'semantic-ui-css/semantic.min.css';


import { Card } from 'semantic-ui-react';
import Navbar from "../components/navbarComponent/Navbar";

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
                <Card style={{margin: "auto", width: "70%"}}>
                    <Card.Content>
                        <Card.Header>Recent Activity</Card.Header>
                    </Card.Content>
                    <Card.Content>
                        <div>landing page</div>
                        {this.state.userAddress.length > 0 ?
                            <div>At address: {this.state.userAddress}</div> :
                            <div>You need to madafakin login</div>
                        }

                        <div>At ticket: {this.props.tickets}</div>
                        <button onClick={this.getAllTickets}>lamxlka</button>
                    </Card.Content>

                </Card>

            </div>
        )
    }
}

export default Landing;