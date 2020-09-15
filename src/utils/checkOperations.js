// this fn gets every key from req.body and checks if there are props that can
// be updated according to the 2nd arg, returning an error otherwise. Mongoose
// doesn't crash if this is not handled, but fails silently.
const checkValidOps = (updates, allowedUpdates) => {
	const getUpdates = Object.keys(updates)

	return getUpdates.every((update) => allowedUpdates.includes(update))
}

module.exports = checkValidOps
