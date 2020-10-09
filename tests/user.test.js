const request = require('supertest')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const app = require('../src/app')
const User = require('../src/models/user')

const userID = new mongoose.Types.ObjectId()
const userMike = {
	_id: userID,
	name: 'Mike',
	email: 'mike@mlo.com',
	password: '21dbad8c',
	tokens: [
		{
			token: jwt.sign({ _id: userID }, process.env.JWT_SECRET),
		},
	],
}

beforeEach(async () => {
	await User.deleteMany()
	await new User(userMike).save()
})

test('Should sign-up a new user', async () => {
	const res = await request(app)
		.post('/users')
		.send({
			// will be wiped on beforeEach
			name: 'Mateus',
			email: 'mmlo@mlo.com',
			password: 'computer42069@',
		})
		.expect(201)

	expect(res.body).toMatchObject({
		user: {
			name: 'Mateus',
			email: 'mmlo@mlo.com',
		},
	})
})

test('Should login existing user', async () => {
	const res = await request(app)
		.post('/users/login')
		.send({
			email: userMike.email,
			password: userMike.password,
		})
		.expect(200)

	const user = await User.findById(userID)

	expect(res.body.token).toBe(user.tokens[1].token)
})

test('Should not login unregistered user', async () => {
	await request(app)
		.post('/users/login')
		.send({
			email: 'mmlo@mlo.com',
			password: 'computer42069@',
		})
		.expect(400)
})

test('Should get user profile', async () => {
	await request(app)
		.get('/users/me')
		.set('Authorization', `Bearer ${userMike.tokens[0].token}`)
		.send()
		.expect(200)
})

test('Should not get profile for unathenticated user', async () => {
	await request(app).get('/users/me').send().expect(401)
})

test('Should delete user account', async () => {
	await request(app)
		.delete('/users/me')
		.set('Authorization', `Bearer ${userMike.tokens[0].token}`)
		.send()
		.expect(200)

	const user = await User.findById(userID)
	expect(user).toBeNull()
})

test('Should not delete unathenticated user', async () => {
	await request(app).delete('/users/me').send().expect(401)
})

test('Should upload user avatar img', async () => {
	await request(app)
		.post('/users/me/avatar')
		.set('Authorization', `Bearer ${userMike.tokens[0].token}`)
		.attach('avatar', 'tests/fixtures/profile-pic.jpg')
		.expect(200)

	const user = await User.findById(userID)
	expect(user.avatar).toEqual(expect.any(Buffer))
})

test('Should update valid user fields', async () => {
	await request(app)
		.patch('/users/me')
		.set('Authorization', `Bearer ${userMike.tokens[0].token}`)
		.send({
			name: 'Paul',
		})
		.expect(200)

	const user = await User.findById(userID)

	expect(user.name).toEqual('Paul')
})

test('Should not update invalid user fields', async () => {
	const res = await request(app)
		.patch('/users/me')
		.set('Authorization', `Bearer ${userMike.tokens[0].token}`)
		.send({
			location: 'Osasco',
		})
		.expect(400)

	expect(res.body).toMatchObject({
		error: 'Invalid updates.',
	})
})
