import { FastifyRequest, FastifyReply } from 'fastify';
import speakeasy from 'speakeasy';
import { User } from '../utils/db_model';
import { JWTpayload } from '../utils/interfaces';

export async function check2FA(request: FastifyRequest, reply: FastifyReply) {
	const payload = request.user as JWTpayload;
	const id = payload.user_id;
	const user = await User.findByPk(id);
	if (!user) {
		return reply.code(404).send({ error: 'User not found' });
	}
	const code2FA = request.body as string; // check if length is 6 digits by the front
	if (!code2FA) {
		return reply.code(400).send({ error: 'Code is required' });
	}
	if (!/^\d{6}$/.test(code2FA)) {
		return reply.code(400).send({ error: 'Le token doit contenir 6 chiffres' });
	}
	const verified = speakeasy.totp.verify({
		secret: user.twoFA_secret as string,
		encoding: 'base32',
		token: code2FA,
		window: 1, // Accepte les tokens avec 1 période de tolérance (30s avant/après)
	});
	if (!verified) {
		return reply.code(400).send({ error: 'Invalid 2FA code' });
	}
	await User.update(
		{ last_login: new Date() },
		{ where: { user_id: user.user_id } },
	);
	const token = reply.jwtSign(
		{ mail_adress: user.email_adress, user_id: user.user_id },
		{ expiresIn: '15min' }
	);
	const refreshToken = reply.jwtSign(
		{ mail_adress: user.email_adress, user_id: user.user_id },
		{ expiresIn: '7d' }
	);
	return reply.code(200).send({ token: token, refreshToken });
}