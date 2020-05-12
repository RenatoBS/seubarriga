const bodyParser = require('body-parser')
const knexlogger = require("knex-logger");

// eslint-disable-next-line no-undef
module.exports = (app) => {
    app.use(bodyParser.json())
    app.use(knexlogger(app.db));

}