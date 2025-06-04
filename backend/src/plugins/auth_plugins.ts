import fp from 'fastify-plugin';
import jwt from '@fastify/jwt'

export default fp(async (fastify) => {
	fastify.register(jwt, {
		secret: process.env.JWT_SECRET_KEY || 'blonde',
		sign: { expiresIn: '1h' }
	});

	fastify.decorate('authenticate', async function (request: any, reply: any) {
		try {
			await request.jwtVerify();
		} catch (err) {
			reply.code(401).send('Token is invalid or expired');
		}
	});
});