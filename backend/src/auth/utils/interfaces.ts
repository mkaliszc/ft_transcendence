export interface JWTpayload {
	email_adress: string;
	user_id: number;
}

export interface SignUpRequest {
	username: string;
	email_adress: string;
	password: string;
	creation_date?: Date;
	avatar?: string;
	twoFA?: boolean;
}