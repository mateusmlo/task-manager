const app = require('./app')

const PORT = process.env.PORT

app.listen(PORT, () => {
	console.log(`🔌 Server is up and running at http://localhost:${PORT}`)
})
