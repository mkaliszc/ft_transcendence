import { FastifyRequest, FastifyReply } from 'fastify'
import bcrypt from 'bcryptjs'
import { User } from '../utils/db_model'

export async function sign_in(username: string, password: string, reply:FastifyReply) {
  try {
		const user = await User.findOne({ where: { username: username } })
		if (!user) {
		  return reply.code(401).send({ error: 'User not found' })
		}
		const isPasswordValid = await bcrypt.compare(password, user.hashed_password)
		if (!isPasswordValid) {
		  return reply.code(401).send({ error: 'Invalid password' })
		}
		if(user.twoFA) {
			// TODO : add 2FA verification
		}
		return reply.code(200).send({ message: 'Login successful', user })
	}
	catch (error) 
	{
		console.error('Error during sign-in:', error)
		return reply.code(500).send({ error: 'Internal server error' })
	}
}