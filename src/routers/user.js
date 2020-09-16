const { Router } = require('express')
const User = require('../models/user')
const checkValidOps = require('../utils/checkOperations')

const router = new Router()

// create post
router.post('/users', async (req, res) => {
	try {
		const newUser = new User(req.body)
		const saveUser = await newUser.save()

		res.status(201).send(saveUser)
	} catch (err) {
		res.status(500).send()
	}
})

//
router.post('/users/login', async (req, res) => {
	try {
		const user = await User.findByCredentials(
			req.body.email,
			req.body.password
		)

		res.send(user)
	} catch (err) {
		res.status(400).send()
	}
})

// GET all users
router.get('/users', async (req, res) => {
	try {
		const allUsers = await User.find({})
		res.send(allUsers)
	} catch (err) {
		res.status(500).send()
	}
})

// GET single user by _id
router.get('/users/:id', async (req, res) => {
	try {
		const _id = req.params.id

		const user = await User.findById(_id)
		if (!user) return res.status(404).send()

		res.send(user)
	} catch (err) {
		res.status(500).send()
		log(err)
	}
})

// UPDATE/PATCH user
router.patch('/users/:id', async (req, res) => {
	const isValidOp = checkValidOps(req.body, [
		'name',
		'email',
		'password',
		'age',
	])

	try {
		if (!isValidOp)
			return res.status(400).send({
				error: 'Invalid updates.',
			})

		// findByIdAndUpdate is no longer usable since we need a middleware to
		// run before the user is saved (password hashing) and this method bypasses it
		const _id = req.params.id
		const user = await User.findById(_id)
		if (!user) return res.status(404).send()

		//const updates = Object.keys(req.body)
		//updates.map((update) => (user[update] = req.body[update]))
		Object.assign(user, req.body)

		await user.save()
		res.send(user)
	} catch (err) {
		res.status(500).send()
		log(err)
	}
})

// DELETE user by _id
router.delete('/users/:id', async (req, res) => {
	try {
		const _id = req.params.id
		const user = await User.findByIdAndDelete(_id)

		if (!user) return res.status(404).send()

		res.send(user)
	} catch (err) {
		res.status(500).send()
	}
})

module.exports = router
