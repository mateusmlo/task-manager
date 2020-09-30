const { Router } = require('express')
const User = require('../models/user')
const checkValidOps = require('../utils/checkOperations')
const auth = require('../middleware/auth')

const router = new Router()

// CREATE new user
router.post('/users', async (req, res) => {
	try {
		const newUser = new User(req.body)

		const saveUser = await newUser.save()
		const token = await newUser.generateAuthToken()

		res.status(201).send({ saveUser, token })
	} catch (err) {
		res.status(500).send({ error: 'Unable to create user.' })
	}
})

// LOGIN user
router.post('/users/login', async (req, res) => {
	try {
		const user = await User.findByCredentials(
			req.body.email,
			req.body.password
		)

		const token = await user.generateAuthToken()

		res.send({
			user,
			token,
		})
	} catch (err) {
		res.status(400).send({ err })
	}
})

// LOGOUT user
router.post('/users/logout', auth, async (req, res) => {
	try {
		req.user.tokens = req.user.tokens.filter(
			(userToken) => userToken.token !== req.token
		)

		await req.user.save()

		res.send({ info: 'User logged out.' })
	} catch (err) {
		res.status(500).send(err)
	}
})

// LOGOUT of all sessions - wipe tokens
router.post('/users/logoutAll', auth, async (req, res) => {
	try {
		req.user.tokens = []
		await req.user.save()

		res.send({ info: 'Logged out of all sessions.' })
	} catch (err) {
		res.status(500).send(err)
	}
})

// GET current loged-in user
router.get('/users/me', auth, async (req, res) => {
	res.send(req.user)
})

// UPDATE/PATCH user
router.patch('/users/me', auth, async (req, res) => {
	const isValidOp = checkValidOps(req.body, [
		'name',
		'email',
		'password',
		'age',
	])

	if (!isValidOp)
		return res.status(400).send({
			error: 'Invalid updates.',
		})

	try {
		Object.assign(req.user, req.body)

		await req.user.save()
		res.send(req.user)
	} catch (err) {
		res.status(500).send()
		log(err)
	}
})

// DELETE user by _id
router.delete('/users/me', auth, async (req, res) => {
	try {
		await req.user.remove()

		res.send(req.user)
	} catch (err) {
		res.status(500).send()
	}
})

module.exports = router
