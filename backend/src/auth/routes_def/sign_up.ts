import { FastifyRequest, FastifyReply } from 'fastify'
import { Op } from 'sequelize';
import bcrypt from 'bcryptjs'
import { User } from '../utils/db_model'

interface SignUpRequest {
	username: string;
	email_adress: string;
	password: string;
	creation_date?: Date;
	avatar?: string;
	twoFA?: boolean;
}

export async function sign_up (request: FastifyRequest<{ Body: SignUpRequest }>, reply: FastifyReply)
{
	try {
	  const { username, email_adress, password, creation_date, avatar, twoFA } = request.body
	  
	  const existingUser = await User.findOne({ 
		  where: { 
			  [Op.or]: [
				  { email_adress }, 
				  { username }
				] 
			} 
		})
		if (existingUser) {
			return reply.status(400).send({ error: 'Username or email already exists' })
		}

	  const hashed_password = await bcrypt.hash(password, 13)
	  const newUser = await User.create({
		username,
		email_adress,
		hashed_password,
		creation_date,
		avatar,
		twoFA
	  })

	  if (!newUser) {
		return reply.status(400).send({ error: 'User creation failed' })
	  }
	  reply.status(201).send(newUser)
	} catch (error) {
	  reply.status(500).send({ error: 'Error creating user' })
	}
}