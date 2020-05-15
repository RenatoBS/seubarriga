const app = require("express")();
const consign = require("consign");

const knex = require("knex");
const knexfile = require("../knexfile");


app.db = knex(knexfile.test);

// app.get('/users', (req, res, next) => {
//   console.log('passei aqui')
//   next()
// })

consign({ cwd: "src", verbose: false })
  .include("./config/passport.js")
  .then("./config/middleware.js")
  .then("./services")
  .then("./routes")
  .then("./config/router.js")
  .into(app);

app.get("/", (req, res) => {
  res.status(200).send();
});

app.get("/user", (req, res) => {
  const users = [{ name: "Jhon Doe", mail: "jhon@mail.com" }];
  res.status(200).json(users)
});

app.use((err, req, res, next) => {
  const { name, message, stack } = err
  if (name === 'ValidationError') res.status(400).json({ error: message })
  if (name === 'RecursoIndevidoError') res.status(403).json({ error: message })
  else res.status(500).json({ name, message, stack })
  next(err)
})

// MIDDLEWARE DE TRATAMENTO UNIVERSAL PARA ROTAS NÃO ENCONTRADAS PELO ROUTER
//app.use((req, res) => {
//  res.status(404).send('Não conheço essa requisição')
//})

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
module.exports = app;
