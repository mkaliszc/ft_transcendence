import { User } from "../../db_models/user_model";
import { Friendship } from "../../db_models/friendship_model";
import { FriendshipRequest } from "../../interfaces";
import { FastifyRequest, FastifyReply } from "fastify";

export async function friendrequest(request: FastifyRequest<{Body: FriendshipRequest}>, reply: FastifyReply) {
	const { user_id1, user_id2, status } = request.body;

	if (!user_id1 || !user_id2 || !status) {
		return reply.status(400).send({ error: 'Missing required fields' });
	}

	try {
		const user1 = await User.findByPk(user_id1);
		const user2 = await User.findByPk(user_id2);

		if (!user1 || !user2) {
			return reply.status(404).send({ error: 'One or both users not found' });
		}
		const NewFriendship = Friendship.create({
			user_id1: user1.user_id,
			user_id2: user2.user_id,
			status: status,
		})

		if (!NewFriendship) {
			return reply.status(400).send({ error: 'Failed to create friendship' });
		}
		return reply.status(200).send({ message: 'Friend request processed successfully', status });
	} catch (error) {
		console.error('Error processing friend request:', error);
		return reply.status(500).send({ error: 'Internal server error' });
	}
}