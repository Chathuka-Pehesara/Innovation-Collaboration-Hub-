import crypto from 'crypto';

/**
 * Verifies the Proof of Work (PoW) submitted by the client.
 * The SHA-256 hash of (email + timestamp + nonce) must start with a target difficulty prefix.
 *
 * @param email - The user's email address
 * @param timestamp - The timestamp when the puzzle was generated/solved
 * @param nonce - The nonce found by the client to solve the puzzle
 */
export function verifyPoW(email: string, timestamp: number, nonce: string): boolean {
    // 1. Check if the timestamp is within 5 minutes to prevent replay attacks
    const now = Date.now();
    const timeDifference = Math.abs(now - timestamp);
    const maxAge = 5 * 60 * 1000; // 5 minutes

    if (timeDifference > maxAge) {
        console.warn(`[SECURITY] PoW rejected: Timestamp expired (diff: ${timeDifference}ms)`);
        return false;
    }

    // 2. Compute the hash: SHA-256(email + timestamp + nonce)
    const data = email.toLowerCase() + timestamp.toString() + nonce;
    const hash = crypto.createHash('sha256').update(data).digest('hex');

    // 3. Difficulty: SHA-256 must start with 4 leading zeros (approx. 65,536 tries on average)
    const targetPrefix = '0000';
    if (!hash.startsWith(targetPrefix)) {
        console.warn(`[SECURITY] PoW rejected: Hash does not meet difficulty. Hash: ${hash}`);
        return false;
    }

    return true;
}
