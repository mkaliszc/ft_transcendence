import { FastifyRequest, FastifyReply } from 'fastify'
import { User } from '../../db_models/user_model';
import { JWTpayload } from '../../interfaces';

export async function disable2FA(request: FastifyRequest, reply: FastifyReply) {
	try {
		// Get user from JWT token
		const user = request.user as JWTpayload;

		// Find user in database
		const userRecord = await User.findByPk(user.user_id);

		if (!userRecord) {
			return reply.status(404).send({ error: 'User not found' });
		}

		// Check if 2FA is already disabled
		if (!userRecord.twoFA) {
			return reply.status(400).send({ error: '2FA is not enabled' });
		}

        // Disable 2FA by removing the secret
		await userRecord.update(
			{ twoFA: false, twoFASecret: null },
			{ where: { user_id : userRecord.user_id } }
		);

		return reply.status(200).send({ 
			message: '2FA has been disabled successfully' 
		});
	} catch (error) {
		console.error('Error disabling 2FA:', error);
		return reply.status(500).send({ 
			error: 'Internal server error while disabling 2FA' 
		});
	}
}