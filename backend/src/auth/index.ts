import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { User } from './utils/db_model'

const fastify: FastifyInstance = Fastify({ logger: true })

const start = async () => {
  try {
    await fastify.listen({ port: 8000 })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()