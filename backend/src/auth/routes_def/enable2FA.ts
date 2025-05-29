import { FastifyRequest, FastifyReply } from 'fastify'
import speakeasy from 'speakeasy';
import { User } from '../utils/db_model';
import QRCode from 'qrcode';
import { DataTypes } from 'sequelize';

export async function enable2FA(request: FastifyRequest, reply: FastifyReply) {
	const { user_id, token, secret } = request.body as {
		user_id: number;
		token: string;
		secret: string;
	};

	try {
		const user = await User.findByPk(user_id);
		if (!user) {
			return reply.code(404).send({ error: 'User not found' });
		}
  
		const secret = speakeasy.generateSecret();
		if (!secret) {
			return reply.code(400).send({ error: 'Internal ERROR' });
		}

		user.twoFA_secret = secret.base32;
		await User.update(
			{ twoFA: true, twoFASecret: secret },
			{ where: { user_id } }
		);
		if (secret.otpauth_url) {
			const qrCode = await QRCode.toDataURL(secret.otpauth_url);
			return reply.send({ qrCode: qrCode, secret: secret.base32 });
		}
		return reply.code(200).send({ success: true, message: '2FA enabled' });
	} catch (error) {
		console.error(error);
		return reply.code(500).send({ error: 'Internal server error' });
	}
}