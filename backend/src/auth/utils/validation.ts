const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;


export function validateEmail(email: string): { isValid: boolean; error?: string } {
	if (!email) {
		return { isValid: false, error: 'Email is required' };
	}
	
	if (email.length > 255) {
		return { isValid: false, error: 'Email is too long (max 255 characters)' };
	}
	
	if (!EMAIL_REGEX.test(email)) {
		return { isValid: false, error: 'Invalid email format' };
	}
	
	const disposableDomains = ['10minutemail.com', 'tempmail.org', 'guerrillamail.com'];
	const domain = email.split('@')[1]?.toLowerCase();
	if (domain && disposableDomains.includes(domain)) {
		return { isValid: false, error: 'Disposable email addresses are not allowed' };
	}
	
	return { isValid: true };
}

export function validateUsername(username: string): { isValid: boolean; error?: string } {
	if (!username) {
		return { isValid: false, error: 'Username is required' };
	}
	
	if (username.length < 3 || username.length > 20) {
		return { isValid: false, error: 'Username must be between 3 and 20 characters' };
	}
	
	if (!USERNAME_REGEX.test(username)) {
		return { isValid: false, error: 'Username can only contain letters, numbers, and underscores' };
	}
	
	const reservedUsernames = ['admin', 'root', 'system', 'api', 'www', 'mail', 'support'];
	if (reservedUsernames.includes(username.toLowerCase())) {
		return { isValid: false, error: 'This username is reserved' };
	}
	
	return { isValid: true };
}