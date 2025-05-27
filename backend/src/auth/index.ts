import Fastify, { FastifyInstance } from 'fastify'
import auth_plugins from './utils/auth_plugins';

const fastify: FastifyInstance = Fastify({ logger: true })

fastify.register(auth_plugins);

const start = async () => {
  try {
    await fastify.listen({ port: 8000 })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()