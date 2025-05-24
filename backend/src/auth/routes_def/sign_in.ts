import { FastifyRequest, FastifyReply } from 'fastify'
import bcrypt from 'bcryptjs'
import { User } from '../utils/db_model'

export async function sign_in(mail_adress: string, password: string, reply:FastifyReply) {
  try {
		const user = await User.findOne({ where: { email_adress: mail_adress } })
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
		await User.update(
			{ last_login: new Date() },
			{ where: { user_id: user.user_id } },
		)
		const token = reply.jwtSign({ mail_adress: user.email_adress, user_id: user.user_id }, { expiresIn: '1h'})
		const refreshToken = reply.jwtSign({ mail_adress: user.email_adress, user_id: user.user_id }, { expiresIn: '7d' })
		return reply.code(200).send({ token: token, refreshToken})
	}
	catch (error) 
	{
		console.error('Error during sign-in:', error)
		return reply.code(500).send({ error: 'Internal server error' })
	}
}