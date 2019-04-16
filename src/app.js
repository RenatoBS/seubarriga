const app = require('express')()
const consign = require('consign')

const knex = require('knex')
const knexfile = require('../knexfile')
const knexlogger = require('knex-logger')

app.db = knex(knexfile.test)
app.use(knexlogger(app.db))

consign({ cwd: 'src', verbose: false })
    .include('./config/middleware.js')
    .then('./services')
    .then('./routes')
    .then('./config/routes.js')
    .into(app)
app.get('/', (req, res) => {
    res.status(200).send()
})
// ALTERNATIVA PARA LOGGER DE ACESSO AO BANCO
// app.db.on('query', (query) => {
//     // eslint-disable-next-line no-console
//     console.log({ sql: query.sql, bindings: query.bindings ? query.bindings.join(',') : '' })
// }).on('query-response', response => {
//     // eslint-disable-next-line no-console
//     console.log(response)
// }).on('error', error =>
//     // eslint-disable-next-line no-console
//     console.log(error))
// eslint-disable-next-line no-undef
module.exports = app
