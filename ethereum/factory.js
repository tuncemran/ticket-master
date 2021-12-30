import web3 from "./web3";
import TicketFactory from "./build/TicketFactory.json";

const instance = new web3.eth.Contract(
    JSON.parse(TicketFactory.interface),
    '0xD8C43F8A41720CD246A4bd6e50A27e17B3436575'
);

export default instance;