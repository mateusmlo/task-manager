const mongoose = require('mongoose')
const Task = require('./task')
const { isEmail, contains } = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema(
	{
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
					throw new Error(
						"Password cannot contain the word 'password'"
					)
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

		avatar: {
			type: Buffer,
		},
	},
	{
		timestamps: true,
	}
)

userSchema.virtual('tasks', {
	ref: 'Task',
	localField: '_id',
	foreignField: 'owner',
})

// methods can be used as fns available through model instances, that is, after
// new User() is evoked and done
userSchema.methods.generateAuthToken = async function () {
	const user = this

	const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET)

	user.tokens = [...user.tokens, { token }]
	await user.save()

	return token
}

userSchema.methods.toJSON = function () {
	const user = this
	const userProfile = user.toObject()

	delete userProfile.password
	delete userProfile.tokens
	delete userProfile.avatar

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
// this one hashes the password before saving user doc to db
userSchema.pre('save', async function (next) {
	const user = this

	if (user.isModified('password'))
		user.password = await bcrypt.hash(user.password, 8)

	next()
})

// delete user tasks when a user deletes their account
userSchema.pre('remove', async function (next) {
	const user = this

	await Task.deleteMany({ owner: user._id })

	next()
})

const User = mongoose.model('User', userSchema)

module.exports = User
