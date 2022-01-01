const routes = require('next-routes')();

routes.add('/ticket/:ticketId', '/ticket/[ticketId]');

module.exports = routes;