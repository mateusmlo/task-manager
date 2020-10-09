const { Router } = require('express')
const multer = require('multer')
const sharp = require('sharp')
const User = require('../models/user')
const checkValidOps = require('../utils/checkOperations')
const auth = require('../middleware/auth')
const { sendWelcomeEmail, sendGoodbyeEmail } = require('../emails/account')

const router = new Router()

// CREATE new user
router.post('/users', async (req, res) => {
	try {
		const newUser = new User(req.body)
		const savedUser = await newUser.save()

		sendWelcomeEmail(savedUser.email, savedUser.name)

		const token = await newUser.generateAuthToken()

		res.status(201).send({ user: savedUser, token })
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
	}
})

// DELETE user by _id
router.delete('/users/me', auth, async (req, res) => {
	try {
		await req.user.remove()
		sendGoodbyeEmail(req.user.email, req.user.name)

		res.send(req.user)
	} catch (err) {
		res.status(500).send()
	}
})

// USER avatars handling routes

const uploadAvatar = multer({
	limits: {
		fileSize: 1000000,
	},
	fileFilter(req, file, cb) {
		if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
			return cb(new Error('Please upload a valid image.'))
		}

		cb(undefined, true)
	},
})

const errorHandlerMW = (err, req, res, next) =>
	res.status(400).send({ error: err.message })

router.post(
	'/users/me/avatar',
	auth,
	uploadAvatar.single('avatar'),
	async (req, res) => {
		const imgBuffer = await sharp(req.file.buffer)
			.resize({ width: 250, height: 250 })
			.png()
			.toBuffer()

		req.user.avatar = imgBuffer
		await req.user.save()

		res.send({ info: 'Avatar uploaded succesfuly.' })
	},
	errorHandlerMW
)

router.delete('/users/me/avatar', auth, async (req, res) => {
	try {
		if (!req.user.avatar)
			return res.status(202).send({ info: 'No avatar to be deleted.' })

		req.user.avatar = undefined
		await req.user.save()

		res.send({ info: 'Avatar removed succesfuly.' })
	} catch (err) {
		res.status(500).send()
	}
})

router.get('/users/:id/avatar', async (req, res) => {
	try {
		const _id = req.params.id
		const user = await User.findById(_id)

		if (!user || !user.avatar)
			throw new Error(
				'User does not exist or does not have a profile picture.'
			)

		res.set('Content-Type', 'image/png')
		res.send(user.avatar)
	} catch (err) {
		res.status(404).send({ err })
	}
})

module.exports = router
