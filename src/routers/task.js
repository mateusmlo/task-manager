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

// GET all (user) tasks matching query
router.get('/tasks', auth, async (req, res) => {
	const match = {}
	const sort = {}

	// this is a typecast, since the query will return us a string and not a
	// boolean, we just check the value and get a real boolean from it
	if (req.query.completed) {
		match.completed = req.query.completed === 'true'
	}

	if (req.query.sortBy) {
		// the sortBy query has three variations and is divided in two.
		// createdAt || updatedAt || completed, followed by :asc || :desc, which
		// represents the order they're going to be displayed. -1 is for
		// descending, 1 is for ascending. We split and convert this value to an
		// int
		const queryParts = req.query.sortBy.split(':')
		sort[queryParts[0]] = queryParts[1] === 'desc' ? -1 : 1
	}

	try {
		await req.user
			.populate({
				path: 'tasks',
				match,
				options: {
					limit: parseInt(req.query.limit),
					skip: parseInt(req.query.skip),
					sort,
				},
			})
			.execPopulate()

		res.send(req.user.tasks)
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
