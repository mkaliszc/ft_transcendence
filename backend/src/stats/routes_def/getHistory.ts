import { User } from "../../db_models/user_model";
import { UserMatch } from "../../db_models/user_match_model";
import { Matches } from "../../db_models/matches_model";
import { FastifyRequest, FastifyReply } from "fastify";

export async function getHistory(request: FastifyRequest<{ Params: { username: string } }>, reply: FastifyReply) {
	try {
		const tag = request.params.username;
		if (!tag) {
			return reply.status(400).send({ error: 'Username is required' });
		}

		const user = await User.findOne({ where: { username: tag } ,});

		if (!user) {
			return reply.status(404).send({ error: 'User not found' });
		}

		const userId = user.user_id;
		const matches = await UserMatch.findAll({
			where:
				{ user_id: userId }
		}); // TODO: complete this with associations and Include (see claude)
	}
	catch (error) {
		console.error('Error fetching user:', error);
		return reply.status(500).send({ error: 'Internal server error' });
	}
}