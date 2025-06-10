import { Pub_User, JWTpayload } from "../../interfaces";
import { User } from "../../db_models/user_model";
import { FastifyRequest, FastifyReply } from "fastify";

export async function getUser(request: FastifyRequest<{ Params: { user_id: string } }>, reply: FastifyReply) {
	try {
		const payload = request.user as JWTpayload;
		const id = payload.user_id;
		const user = await User.findByPk(id)

		if (!user) {
			return reply.status(404).send({ error: 'User not found' });
		}

		const Public: Pub_User = {
			user_id: user.user_id,
			username: user.username,
			email_adress: user.email_adress,
			number_of_matches: user.number_of_matches,
			number_of_win: user.number_of_win,
			number_of_lose: user.number_of_lose,
			created_at: user.creation_date,
			updated_at: user.last_update,
			avatar: user.avatar,
			twoFA: user.twoFA
		};

		return reply.status(200).send(Public);
	} catch (error) {
		console.error('Error fetching user:', error);
		return reply.status(500).send({ error: 'Internal server error' });
	}
}