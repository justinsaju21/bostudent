import crypto from 'crypto';

const ADMIN_SECRET = process.env.ADMIN_SECRET;
const TOKEN_EXPIRY = 8 * 60 * 60 * 1000; // 8 hours

function getSecret(): string {
    if (!ADMIN_SECRET) {
        throw new Error('ADMIN_SECRET environment variable is not configured');
    }
    return ADMIN_SECRET;
}

function signToken(payload: string): string {
    const hmac = crypto.createHmac('sha256', getSecret());
    hmac.update(payload);
    return hmac.digest('hex');
}

export function createAdminToken(): string {
    const timestamp = Date.now().toString();
    const signature = signToken(timestamp);
    return `${timestamp}.${signature}`;
}

export function verifyAdminToken(token: string): boolean {
    try {
        const [timestamp, signature] = token.split('.');
        if (!timestamp || !signature) return false;

        // Check if token is expired (8 hours)
        const tokenTime = parseInt(timestamp, 10);
        const now = Date.now();
        if (now - tokenTime > 8 * 60 * 60 * 1000) return false;

        // Verify signature
        const expectedSignature = signToken(timestamp);
        return crypto.timingSafeEqual(
            Buffer.from(signature, 'hex'),
            Buffer.from(expectedSignature, 'hex')
        );
    } catch {
        return false;
    }
}
