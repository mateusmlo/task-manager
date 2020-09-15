const express = require('express')
require('./db/mongoose')
const log = console.log

// import routes
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())

// register routes
app.use(userRouter)
app.use(taskRouter)

app.listen(PORT, () => {
	log(`🔌 Server is up and running at http://localhost:${PORT}`)
})
