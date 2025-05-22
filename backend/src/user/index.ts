import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { User } from './utils/db_model'

const fastify: FastifyInstance = Fastify({ logger: true })

fastify.post('/user', async (request: FastifyRequest<{ Body: User }>, reply: FastifyReply) => {
  try {
    const { username, email_adress, hassed_password, creation_date, avatar, twoFA } = request.body

    // Create the user using Sequelize
    const newUser = await User.create({
      username,
      email_adress,
      hassed_password,
      creation_date,
      avatar,
      twoFA
    })

    reply.status(201).send(newUser)
  } catch (error) {
    fastify.log.error(error)
    reply.status(500).send({ error: 'Error creating user' })
  }
})

const start = async () => {
  try {
    await fastify.listen({ port: 8000 })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()