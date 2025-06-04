import { FastifyRequest, FastifyReply } from 'fastify'
import bcrypt from 'bcryptjs'
import { User } from '../../db_models/user_model'

export async function sign_in(request: FastifyRequest, reply:FastifyReply) {
	const { mail_adress, password } = request.body as {
		mail_adress: string;
		password: string;
	};
	try {
		const user = await User.findOne({ where: { email_adress: mail_adress } })
		if (!user) {
		  return reply.code(400).send({ error: 'User not found' })
		}
		const isPasswordValid = await bcrypt.compare(password, user.hashed_password)
		if (!isPasswordValid) {
		  return reply.code(400).send({ error: 'Invalid password' })
		}
		if(user.twoFA) {
			const tmp_token = reply.jwtSign({
				mail_adress: user.email_adress,
				user_id: user.user_id,
				twoFA: true }, { expiresIn: '2m' });
			return reply.code(200).send({ token: tmp_token})
		}
		await User.update(
			{ last_login: new Date() },
			{ where: { user_id: user.user_id } },
		)
		const token = reply.jwtSign({ mail_adress: user.email_adress, user_id: user.user_id }, { expiresIn: '15min'})
		const refreshToken = reply.jwtSign({ mail_adress: user.email_adress, user_id: user.user_id }, { expiresIn: '7d' })
		return reply.code(200).send({ token: token, refreshToken})
	}
	catch (error) 
	{
		console.error('Error during sign-in:', error)
		return reply.code(500).send({ error: 'Internal server error' })
	}
}