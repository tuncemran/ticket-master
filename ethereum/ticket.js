import web3 from "./web3";
import Ticket from "./build/Ticket.json";

const TicketContract = (address) => {
    return new web3.eth.Contract(
        JSON.parse(Ticket.interface),
        address
    );
}
export default TicketContract;

