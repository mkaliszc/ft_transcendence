import { FastifyRequest, FastifyReply } from 'fastify';
import { Friendship } from '../../db_models/friendship_model';
import { User } from '../../db_models/user_model';
import { Op } from 'sequelize';
import { JWTpayload } from '../../interfaces';

export async function friendList(request: FastifyRequest, reply: FastifyReply) {
	try {
		const payload = request.user as JWTpayload;
		const userId = payload.user_id;

		if (!userId) {
			return reply.status(400).send({ error: 'User ID is required' });
		}

		const friendships = await Friendship.findAll({
			where: {
				[Op.or]: [
					{ user_id1: userId, status: 'accepted' },
					{ user_id2: userId, status: 'accepted' }
				]
			},
			include: [
				{
					model: User,
					as: 'friend',
					attributes: ['username']
				}
			],
			order: [['creation_date', 'DESC']]
		});

		if (!friendships || friendships.length === 0) {
			return reply.code(200).send({
				message: 'No friends found',
				friends: []
			});
		}
		// TODO : finish the formatting of the response
	}
	catch (error) {
		console.error('Error fetching friend list:', error);
		return reply.status(500).send({ error: 'Internal server error while fetching friend list' });
	}
}