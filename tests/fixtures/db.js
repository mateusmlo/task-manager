const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const User = require('../../src/models/user')
const Task = require('../../src/models/task')

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

const userID_2 = new mongoose.Types.ObjectId()
const userBryan = {
	_id: userID_2,
	name: 'Bryan',
	email: 'bryan@mlo.com',
	password: 'computer42069',
	tokens: [
		{
			token: jwt.sign({ _id: userID_2 }, process.env.JWT_SECRET),
		},
	],
}

const taskMike = {
	_id: new mongoose.Types.ObjectId(),
	description: 'Test task for Mike',
	owner: userMike._id,
}

const taskBryan = {
	_id: new mongoose.Types.ObjectId(),
	description: 'Test task for Bryan',
	completed: true,
	owner: userBryan._id,
}

const taskBryan_2 = {
	_id: new mongoose.Types.ObjectId(),
	description: 'Another test task for Bryan',
	owner: userBryan._id,
}
const setupDb = async () => {
	await User.deleteMany()
	await Task.deleteMany()

	await new User(userMike).save()
	await new User(userBryan).save()
	await new Task(taskMike).save()
	await new Task(taskBryan).save()
	await new Task(taskBryan_2).save()
}

module.exports = {
	userID,
	userMike,
	userBryan,
	taskMike,
	setupDb,
}
