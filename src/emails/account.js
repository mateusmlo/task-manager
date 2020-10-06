const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
	sgMail.send({
		to: email,
		from: 'mateus.mlo95@gmail.com',
		subject: 'Thanks for joining us!',
		text: `Welcome to the Task Manager, ${name}. Let us know how you get along with the app!`,
	})
}

const sendGoodbyeEmail = (email, name) => {
	sgMail.send({
		to: email,
		from: 'mateus.mlo95@gmail.com',
		subject: 'Goodbye and thanks for the fish',
		text: `We're sad to see you go, ${name}! Please let us know what we can improve on the app, and we hope to have you back on the future.`,
	})
}

module.exports = { sendWelcomeEmail, sendGoodbyeEmail }
