const mongoose = require('mongoose')
const { isEmail, contains } = require('validator')

const User = mongoose.model('User', {
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
})

module.exports = User
