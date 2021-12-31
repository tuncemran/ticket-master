const routes = require('next-routes')();

routes.add('/ticket/:ticketId', '/ticket/show');

module.exports = routes;