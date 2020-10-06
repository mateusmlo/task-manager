const express = require('express')
const morgan = require('morgan')
require('./db/mongoose')
const log = console.log

// import routes
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

const app = express()
const PORT = process.env.PORT

// logger middleware
app.use(morgan('dev'))

app.use(express.json())

app.use(userRouter)
app.use(taskRouter)

app.listen(PORT, () => {
	log(`🔌 Server is up and running at http://localhost:${PORT}`)
})
