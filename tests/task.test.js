const request = require('supertest')
const mongoose = require('mongoose')
const Task = require('../src/models/task')
const app = require('../src/app')
const { userMike, taskMike, userBryan, setupDb } = require('./fixtures/db')

beforeEach(setupDb)

afterAll(async () => {
	await mongoose.disconnect()
})

test('Should create a task for user', async () => {
	const res = await request(app)
		.post('/tasks')
		.set('Authorization', `Bearer ${userMike.tokens[0].token}`)
		.send({
			description: 'Test task',
		})
		.expect(201)

	const task = await Task.findById(res.body._id)
	expect(task).not.toBeNull()
	expect(task.completed).toEqual(false)
})

test('Should get all user tasks', async () => {
	const res = await request(app)
		.get('/tasks')
		.set('Authorization', `Bearer ${userBryan.tokens[0].token}`)
		.send()
		.expect(200)

	const tasks = res.body
	expect(tasks.length).toEqual(2)
})

test('User Bryan should not delete user Mike task', async () => {
	await request(app)
		.delete('/tasks/')
		.query({ id: taskMike._id })
		.set('Authorization', `Bearer ${userBryan.tokens[0].token}`)
		.send()
		.expect(404)

	// task has not been deleted
	const task = await Task.findById(taskMike._id)
	expect(task).not.toBeNull()
})
