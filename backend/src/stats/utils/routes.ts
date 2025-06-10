import fp from 'fastify-plugin';
import { getUser } from '../routes_def/getUser';
import { deleteUser } from '../routes_def/deleteUser';
import { update } from '../routes_def/update';
import { getHistory } from '../routes_def/getHistory';

export default fp(async function routes_stats(fastify: any) {
	fastify.get('/stats/user', { preHandler: fastify.authenticate }, getUser);
	fastify.delete('/stats/delete', { preHandler: fastify.authenticate }, deleteUser);
	fastify.patch('/stats/update', { preHandler: fastify.authenticate }, update);
	fastify.get('/stats/hitory/:username', { preHandler: fastify.authenticate }, getHistory);
	// TODO : change password | fiend list | friend request | friend delete | friend accept
});