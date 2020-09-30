const { Router } = require('express')
const Task = require('../models/task')
const auth = require('../middleware/auth')
const checkValidOps = require('../utils/checkOperations')

const router = new Router()

// create task
router.post('/tasks', auth, async (req, res) => {
	try {
		const newTask = new Task({
			...req.body,
			owner: req.user._id,
		})

		const saveTask = await newTask.save()

		res.status(201).send(saveTask)
	} catch (err) {
		res.status(500).send()
	}
})

// GET all (user) tasks
router.get('/tasks', auth, async (req, res) => {
	try {
		const allTasks = await Task.find({ owner: req.user._id })
		res.send(allTasks)
	} catch (err) {
		res.status(500).send()
	}
})

// GET single task by _id
router.get('/tasks/:id', auth, async (req, res) => {
	try {
		const task_id = req.params.id

		const task = await Task.findOne({
			_id: task_id,
			owner: req.user._id,
		})

		if (!task)
			return res.status(404).send({
				error: 'Task not found',
			})

		res.send(task)
	} catch (err) {
		res.status(500).send()
	}
})

// UPDATE/PATCH task by _id
router.patch('/tasks/:id', auth, async (req, res) => {
	const isValidOp = checkValidOps(req.body, ['completed', 'description'])

	if (!isValidOp)
		return res.status(400).send({
			error: 'Invalid updates.',
		})

	try {
		const task_id = req.params.id
		const task = await Task.findOne({ _id: task_id, owner: req.user._id })

		if (!task) return res.status(404).send({ error: 'Task not found.' })

		Object.assign(task, req.body)

		await task.save()
		res.send(task)
	} catch (err) {
		res.status(500).send()
	}
})

// DELETE task by _id
router.delete('/tasks/:id', auth, async (req, res) => {
	try {
		const task_id = req.params.id
		const task = await Task.findOneAndDelete({
			_id: task_id,
			owner: req.user._id,
		})

		if (!task) return res.status(404).send({ error: 'Task not found.' })

		res.send(task)
	} catch (err) {
		res.status(500).send()
	}
})

module.exports = router
