const createPgModel = require('./createPgModel');

const Model = createPgModel('password_reset_requests');

module.exports = Model;
