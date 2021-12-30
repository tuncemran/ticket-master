const path = require("path");
const solc = require("solc");
const fs = require("fs-extra");

const buildPath = path.resolve(__dirname, "build");
fs.removeSync(buildPath);

const ticketPath = path.resolve(__dirname, "contracts", "Ticket.sol");
const source = fs.readFileSync(ticketPath, "utf8");
const output = solc.compile(source, 1).contracts;
console.log(solc.compile(source, 1))

fs.ensureDirSync(buildPath);

for (let contract in output) {
    fs.outputJsonSync(
        path.resolve(buildPath, contract.replace(':', '') + ".json"),
        output[contract]
    );
}
