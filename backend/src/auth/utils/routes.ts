// import every route from the routes folder
import fp from 'fastify-plugin';
import { sign_in } from '../routes_def/sign_in';
import { sign_up } from '../routes_def/sign_up';

async function routes_auth(fastify: any) {
  fastify.post('/auth', sign_in);
  fastify.register('/auth/register', sign_up);
  fastify.get('/auth/verify2FA', { preValidation: fastify.authenticate }, check2FA);
}

export default fp(routes_auth)