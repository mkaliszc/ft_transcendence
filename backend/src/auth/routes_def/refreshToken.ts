import { FastifyRequest, FastifyReply } from 'fastify';
import { JWTpayload } from '../utils/interfaces';
import { User } from '../utils/db_model';
import fp from 'fastify-plugin';

export async function refreshToken(request: FastifyRequest<{Body: { refreshtoken: string } }>, reply: FastifyReply) {
	try {
	// Verify the refresh token
		const decoded = await request.jwtVerify<JWTpayload>();
        const user = await User.findByPk(decoded.user_id);
        if (!user) {
            return reply.status(400).send({ error: 'User no longer exists' });
        }
	// Generate a new access token
		const newToken = reply.jwtSign({ email_adress: decoded.email_adress, user_id: decoded.user_id }, { expiresIn: '15min' });
	
		return reply.status(200).send({ token: newToken });
	} catch (error) {
		console.error('Error refreshing token:', error);
		return reply.status(401).send({ error: 'Invalid or expired refresh token' });
	}
}