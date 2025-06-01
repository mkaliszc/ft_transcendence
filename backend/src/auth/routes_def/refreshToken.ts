import { FastifyRequest, FastifyReply } from 'fastify';
import { JWTpayload } from '../utils/interfaces';
import { User } from '../utils/db_model';
import fp from 'fastify-plugin';

export async function refreshToken(request: FastifyRequest<{Body: { refreshtoken: string } }>, reply: FastifyReply) {
	try {
	// Verify the refresh token
		const rtoken = request.body;
		const decoded = await request.jwtVerify();
	
	// Generate a new access token
		const newToken = reply.jwtSign({ mail_adress: decoded.mail_adress, user_id: decoded.user_id }, { expiresIn: '15min' });
	
		return reply.status(200).send({ token: newToken });
	} catch (error) {
		console.error('Error refreshing token:', error);
		return reply.status(401).send({ error: 'Invalid or expired refresh token' });
	}
}