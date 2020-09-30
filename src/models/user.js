const mongoose = require('mongoose')
const { isEmail, contains } = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		trim: true,
	},

	email: {
		type: String,
		required: true,
		trim: true,
		lowercase: true,
		unique: true,
		validate(val) {
			if (!isEmail(val)) throw new Error('Email is invalid.')
		},
	},

	password: {
		type: String,
		required: true,
		trim: true,
		minlength: [7, 'Password must have more than six characters.'],
		validate(val) {
			if (contains(val, 'password', { ignoreCase: true }))
				throw new Error("Password cannot contain the word 'password'")
		},
	},

	age: {
		type: Number,
		default: 0,
		validate(num) {
			if (num < 0) throw new Error("Age can't be less than 0.")
		},
	},

	tokens: [
		{
			token: {
				type: String,
				required: true,
			},
		},
	],
})

// methods can be used as fns available through model instances, that is, after
// new User() is evoked and done
userSchema.methods.generateAuthToken = async function () {
	const user = this

	const token = jwt.sign(
		{ _id: user._id.toString() },
		'parangaricotirimirruaro'
	)

	user.tokens = [...user.tokens, { token }]
	await user.save()

	return token
}

userSchema.methods.toJSON = function () {
	const user = this
	const userProfile = user.toObject()

	delete userProfile.password
	delete userProfile.tokens

	return userProfile
}

// statics can be used as functions available through the models
userSchema.statics.findByCredentials = async (email, password) => {
	try {
		const user = await User.findOne({ email })
		const isMatch = await bcrypt.compare(password, user.password)

		if (!user) throw new Error('Unable to login.')
		if (!isMatch) throw new Error('Unable to login.')

		return user
	} catch (err) {
		console.log({ err })
	}
}

// pre is a middleware function that will run before the doc is saved
userSchema.pre('save', async function (next) {
	const user = this

	if (user.isModified('password'))
		user.password = await bcrypt.hash(user.password, 8)

	next()
})

const User = mongoose.model('User', userSchema)

module.exports = User
