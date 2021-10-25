const express = require('express')
require('./db/mongoose')
const userouter = require('./routers/user')
const taskrouter = require('./routers/task')

const app = express()
const port = process.env.PORT || 3000;


app.use(express.json())
app.use(userouter)
app.use(taskrouter)

app.listen(port, () => {
    console.log('Server is up on port '+ port)
})
