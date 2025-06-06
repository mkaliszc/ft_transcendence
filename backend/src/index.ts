import Fastify, { FastifyInstance } from 'fastify'
import { sequelize, testConnection, syncDatabase } from './def';
import auth_plugins from './plugins/auth_plugins';
import routes_auth from './auth/utils/routes';

const fastify: FastifyInstance = Fastify({ logger: true })


fastify.register(auth_plugins);
fastify.register(routes_auth);


const start = async () => {
	try {
        // Test database connection
        // Test database connection with retry logic
        await testConnection(5, 3000); // 5 retries, 3 second delay

        // Sync database with retry logic
        console.log('🔄 Synchronizing database...');
        await syncDatabase(3, 2000); // 3 retries, 2 second delay

        console.log('🚀 Starting Fastify server...');
        await fastify.listen({ port: 8000, host: '0.0.0.0' });
        console.log('✅ Server is running on port 8000');
	} catch (err) {
		fastify.log.error(err)
		process.exit(1)
	}
}

start();