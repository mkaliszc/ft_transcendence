// import every route from the routes_def folder
import fp from 'fastify-plugin';
import { sign_in } from '../routes_def/sign_in';
import { sign_up } from '../routes_def/sign_up';
import { enable2FA } from '../routes_def/enable2FA';
import { check2FA } from '../routes_def/check2FA';
import { disable2FA } from '../routes_def/disable2FA';
import { refreshToken } from '../routes_def/refreshToken';
import { googleCallback } from '../routes_def/google_auth';

export default fp(async function routes_auth(fastify: any) {
	fastify.post('/', sign_in);
	fastify.post('/register', sign_up);
	fastify.post('/refreshtoken', { preHandler: fastify.authenticate }, refreshToken);
	fastify.get('/enable2FA', { preHandler: fastify.authenticate }, enable2FA);
	fastify.post('/check2FA', { preHandler: fastify.authenticate }, check2FA);
	fastify.post('/disable2FA', { preHandler: fastify.authenticate }, disable2FA); 
	fastify.get('/google/callback', googleCallback);
});
