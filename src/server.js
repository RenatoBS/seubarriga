const app = require('./app')
const port = 3001
app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server started date: ${new Date()}, port: ${port}` )
})