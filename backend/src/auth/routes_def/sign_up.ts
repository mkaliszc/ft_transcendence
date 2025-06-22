import { FastifyRequest, FastifyReply } from 'fastify'
import { Op } from 'sequelize';
import bcrypt from 'bcryptjs'
import { User } from '../utils/db_models/user_model'
import { SignUpRequest } from '../utils/interfaces'
import { validateEmail, validateUsername } from '../utils/validation';

export async function sign_up (request: FastifyRequest<{ Body: SignUpRequest }>, reply: FastifyReply)
{
	try {
		const { username, email_adress, password } = request.body
		if (!username || !email_adress || !password) {
			return reply.status(400).send({ error: 'Username, email and password are required' })
		}
		if (typeof username !== 'string' || typeof email_adress !== 'string' || typeof password !== 'string') {
			return reply.status(400).send({ error: 'Username, email and password must be strings' })
		}

		const emailValidation = validateEmail(email_adress);
		if (!emailValidation.isValid) {
			return reply.status(400).send({ error: emailValidation.error });
		}

		const usernameValidation = validateUsername(username);
		if (!usernameValidation.isValid) {
			return reply.status(400).send({ error: usernameValidation.error });
		}

		if (password.length < 8 ) {
			return reply.status(400).send({ error: 'Password must be at least 8 characters' })
		}

		const existingUser = await User.findOne({ where: { [Op.or]: [{ email_adress }, { username }] } })
		if (existingUser) {
			return reply.status(400).send({ error: 'Username or email already exists' })
		}

		const hashed_password = await bcrypt.hash(password, 13)
		const newUser = await User.create({
			username,
			email_adress,
			hashed_password
		})

		if (!newUser) {
			return reply.status(400).send({ error: 'User creation failed' })
		}
		reply.status(201).send({ message: 'User created successfully'})
	}
	catch (error) {
		reply.status(500).send({ error: 'Error creating user' })
	}
}