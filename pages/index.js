import React, { Component } from "react";
import web3 from "../ethereum/web3";
import factory from "../ethereum/factory";
import TicketContract from "../ethereum/ticket";

import "semantic-ui-css/semantic.min.css";
import {
  Modal,
  Image,
  Button,
  Header,
  Input,
  Dimmer,
  Loader,
} from "semantic-ui-react";

import Navbar from "../components/navbarComponent/Navbar";
import LandingNotification from "../components/landingNotificationComponent/LandingNotification";
import TicketComponent from "../components/ticketComponent/TicketComponent";

class Landing extends Component {
  static async getInitialProps() {
    const tickets = await factory.methods.getDeployedTickets().call();
    return { tickets };
  }

  state = {
    userAddress: [],
    allTickets: [],
    isCreateModalActive: false,
    isLoaderActive: false,
    ticketTitle: "",
    ticketDescription: "",
    name: "",
    facebookAccount: "",
    price: "",
  };

  async componentDidMount() {
    // set loader on
    this.setState({ isLoaderActive: true });

    const account = await web3.eth.getAccounts();
    const allTickets = await this.getAllTickets(false);
    this.setState({ userAddress: account, allTickets });

    // set loader off
    this.setState({ isLoaderActive: false });
  }

  getAllTickets = async (contextValid) => {
    const tickets = contextValid === false ? this.props.tickets : await factory.methods.getDeployedTickets().call();

    const allTickets = [];
    for (const ticketKey in tickets) {
      const ticketAddress = tickets[ticketKey];
      const theTicket = TicketContract(ticketAddress);

      const ownerName = await theTicket.methods.ownerName().call();
      const ownerFacebookAccount = await theTicket.methods
        .ownerFacebookAccount()
        .call();
      const ticketTitle = await theTicket.methods.ticketTitle().call();
      const ticketDescription = await theTicket.methods
        .ticketDescription()
        .call();
      const ticketPriceInDollars = await theTicket.methods
        .ticketPriceInDollars()
        .call();
      const ticketStatus = await theTicket.methods.ticketStatus().call();
      const approvalStatus = await theTicket.methods.approvalStatus().call();

      const ticketObject = {
        ownerName,
        ownerFacebookAccount,
        ticketTitle,
        ticketDescription,
        ticketPriceInDollars,
        ticketStatus,
        approvalStatus,
        ticketAddress,
      };
      allTickets.push(ticketObject);
    }
    return allTickets;
  };

  onSubmitNewTicket = async () => {
    // set loader on
    this.setState({ isLoaderActive: true, isCreateModalActive: false });

    await factory.methods
      .createTicket(
        this.state.name,
          this.state.facebookAccount,
          this.state.ticketTitle,
          this.state.ticketDescription,
          this.state.price
      )
      .send({
        from: this.state.userAddress[0],
        gas: "1000000",
      });

    const allTickets = await this.getAllTickets(true);
    this.setState({ allTickets });

    // set loader off
    this.setState({ isLoaderActive: false, isCreateModalActive: false });
  };

  renderTickets() {
    return this.state.allTickets.map((ticket, key) => {
      if (ticket.ticketStatus[3] === true) {
        return (
          <TicketComponent
            key={key}
            ownerName={ticket.ownerName}
            ownerFacebookAccount={ticket.ownerFacebookAccount}
            ticketTitle={ticket.ticketTitle}
            ticketDescription={ticket.ticketDescription}
            ticketPriceInDollars={ticket.ticketPriceInDollars}
            ticketAddress={ticket.ticketAddress}
          />
        );
      }
    });
  }

  renderModal() {
    return (
      <Modal
        onClose={() => this.setState({ isCreateModalActive: false })}
        onOpen={() => this.setState({ isCreateModalActive: true })}
        open={this.state.isCreateModalActive}
        trigger={this.state.userAddress === [] ? null :<Button positive>Create a Ticket Ad</Button>}
      >
        <Modal.Header>Add a Ticket to be Sold</Modal.Header>
        <Modal.Content image>
          <Image
            size="medium"
            src="https://react.semantic-ui.com/images/avatar/large/rachel.png"
            wrapped
          />
          <Modal.Description>
            <Input
              value={this.state.ticketTitle}
              onChange={(e) => this.setState({ ticketTitle: e.target.value })}
              label="Ticket Title"
              placeholder="Unit 1 Friday Ticket"
            />{" "}
            <br /> <br />
            <Input
              value={this.state.ticketDescription}
              onChange={(e) =>
                this.setState({ ticketDescription: e.target.value })
              }
              label="Description"
              placeholder="Early entree, be there before 10pm"
            />{" "}
            <br /> <br />
            <Input
              value={this.state.name}
              onChange={(e) => this.setState({ name: e.target.value })}
              label="Name"
              placeholder="Put a name so that people know it is not fake"
            />{" "}
            <br /> <br />
            <Input
              value={this.state.facebookAccount}
              onChange={(e) =>
                this.setState({ facebookAccount: e.target.value })
              }
              label="Facebook account"
              placeholder="Put your facebook address so people can ask questions to you when necessary"
            />{" "}
            <br /> <br />
            <Input
              value={this.state.price}
              onChange={(e) => this.setState({ price: e.target.value })}
              label="Price in $ ( USD )"
              placeholder="5"
            />{" "}
            <br /> <br />
          </Modal.Description>
        </Modal.Content>
        <Modal.Actions>
          <Button
            color="black"
            onClick={() =>
              this.setState({
                isCreateModalActive: false,
                ticketTitle: "",
                ticketDescription: "",
                name: "",
                facebookAccount: "",
                price: "",
              })
            }
          >
            Nope
          </Button>
          <Button
            content="Create My Ticket"
            labelPosition="right"
            icon="checkmark"
            onClick={() => this.onSubmitNewTicket()}
            positive
          />
        </Modal.Actions>
      </Modal>
    );
  }

  render() {
    return (
      <div>
        {this.state.isLoaderActive ? (
          <Dimmer active inverted>
            <Loader size="large">
              Blockchain needs to confirm this transaction to make this
              experience safe for everyone! <br /> <br /> This usually takes
              10-15 seconds. At the meantime please wait and do not refresh the
              website please...
            </Loader>
          </Dimmer>
        ) : null}
        <Navbar />
        <LandingNotification userAddress={this.state.userAddress} />
        <div style={{width: "100%", justifyContent: 'center', display: 'flex', marginTop: 30}}>
          {this.renderModal()}
        </div>

        <div
          style={{
            margin: "auto",
            marginTop: 40,
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gridGap: 20,
            width: "70%",
          }}
        >
          {this.renderTickets()}
        </div>
      </div>
    );
  }
}

export default Landing;
