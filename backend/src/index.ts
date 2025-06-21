import Fastify, { FastifyInstance } from 'fastify'
import { testConnection } from './def';
import { syncDatabase } from './db_models/syncDatabase';
import auth_plugins from './plugins/auth_plugins';
import google_oauth from './plugins/google_oauth';
import routes_auth from './auth/utils/routes';
import routes_profile from './profile/utils/routes';
import routes_match from './match/utils/routes';

const fastify: FastifyInstance = Fastify({ logger: true })

fastify.register(google_oauth);
fastify.register(auth_plugins);
fastify.register(routes_auth);
fastify.register(routes_profile);
fastify.register(routes_match);

const start = async () => {
	try {
		await testConnection(5, 3000);

		await syncDatabase(3, 2000); // 3 retries, 2 second delay

		await fastify.listen({ port: 8002, host: '0.0.0.0' });
	}
	catch (err) {
		fastify.log.error(err)
		process.exit(1)
	}
}

start();