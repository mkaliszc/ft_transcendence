import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'

const fastify: FastifyInstance = Fastify({
  logger: true
})

// Définir les types pour les requêtes avec paramètres de query
interface PingQuery {
  name: string
}

fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
  return 'hello\n'
})

fastify.get('/ping', async (request: FastifyRequest<{ Querystring: PingQuery }>, reply: FastifyReply) => {
  const { name } = request.query
  return `Hello by: ${name}\n`
})

const start = async () => {
  try {
    await fastify.listen({ port: 3001 })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()