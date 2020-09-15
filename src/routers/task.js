const { Router } = require('express')
const Task = require('../models/task')
const checkValidOps = require('../utils/checkOperations')

const router = new Router()

// create task
router.post('/tasks', async (req, res) => {
	try {
		const newTask = new Task(req.body)
		const saveTask = await newTask.save()

		res.status(201).send(saveTask)
	} catch (err) {
		res.status(500).send()
	}
})

// GET all tasks
router.get('/tasks', async (req, res) => {
	try {
		const allTasks = await Task.find({})
		res.send(allTasks)
	} catch (err) {
		res.status(500).send()
	}
})

// GET single task by _id
router.get('/tasks/:id', async (req, res) => {
	try {
		const _id = req.params.id

		const task = await Task.findById(_id)
		if (!task) {
			return res.status(404).send({
				error: 'Task not found',
			})
		}

		res.send(task)
	} catch (err) {
		res.status(500).send()
		log(err)
	}
})

// UPDATE/PATCH task by _id
router.patch('/tasks/:id', async (req, res) => {
	const isValidOp = checkValidOps(req.body, ['completed', 'description'])

	try {
		if (!isValidOp)
			return res.status(400).send({
				error: 'Invalid updates.',
			})

		const _id = req.params.id

		const task = await Task.findByIdAndUpdate(_id, req.body, {
			new: true,
			runValidators: true,
		})

		if (!task) return res.status(404).send()

		res.send(task)
	} catch (err) {
		res.status(500).send()
		log(err)
	}
})

// DELETE task by _id
router.delete('/tasks/:id', async (req, res) => {
	try {
		const _id = req.params.id
		const task = await Task.findByIdAndDelete(_id)

		if (!task) return res.status(404).send()

		res.send(task)
	} catch (err) {
		res.status(500).send()
	}
})

module.exports = router
