import { FastifyRequest, FastifyReply } from 'fastify'
import speakeasy from 'speakeasy';
import { User } from '../utils/db_model';
import QRCode from 'qrcode';
import { JWTpayload } from '../utils/interfaces';

export async function disable2FA(request: FastifyRequest, reply: FastifyReply) {
	
}