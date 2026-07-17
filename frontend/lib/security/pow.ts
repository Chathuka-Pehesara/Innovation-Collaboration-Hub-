/**
 * @file        pow.ts
 * @owner       Frontend Security Team
 * @description Solves a Proof-of-Work (PoW) SHA-256 challenge before submitting credentials.
 *              Uses a custom synchronous SHA-256 implementation for maximum performance.
 */

// A simple, fast, self-contained SHA-256 implementation in pure JS
function sha256Sync(ascii: string): string {
    function rightRotate(value: number, amount: number) {
        return (value >>> amount) | (value << (32 - amount));
    }

    const lengthProperty = 'length';
    let result = '';

    const words: number[] = [];
    const asciiLength = ascii[lengthProperty] * 8;

    let i, j; // Pre-declare for loop variables

    // Hash values: first 32 bits of the fractional parts of the square roots of the first 8 primes
    const h = [
        0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
        0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
    ];

    // Constants: first 32 bits of the fractional parts of the cube roots of the first 64 primes
    const k = [
        0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
        0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
        0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
        0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
        0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
        0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
        0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
        0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
    ];

    let hashBitLength = asciiLength;
    let paddedAscii = ascii + String.fromCharCode(0x80); // Append a '1' bit
    while ((paddedAscii[lengthProperty] % 64) !== 56) {
        paddedAscii += String.fromCharCode(0); // Pad with zeros
    }

    for (i = 0; i < paddedAscii[lengthProperty]; i++) {
        j = paddedAscii.charCodeAt(i);
        words[i >> 2] |= j << ((3 - (i % 4)) * 8);
    }
    words[words[lengthProperty]] = ((hashBitLength / Math.pow(2, 32)) | 0);
    words[words[lengthProperty]] = (hashBitLength | 0);

    // Process each chunk
    for (i = 0; i < words[lengthProperty]; i += 16) {
        const w = words.slice(i, i + 16);
        const oldH = h.slice(0);

        for (j = 0; j < 64; j++) {
            if (j >= 16) {
                const w15 = w[j - 15], w2 = w[j - 2], w16 = w[j - 16], w7 = w[j - 7];
                const s0 = rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3);
                const s1 = rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10);
                w[j] = (w16 + s0 + w7 + s1) | 0;
            }

            const a = h[0], b = h[1], c = h[2], d = h[3], e = h[4], f = h[5], g = h[6], _h = h[7];
            const s0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
            const maj = (a & b) ^ (a & c) ^ (b & c);
            const temp2 = s0 + maj;
            const s1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
            const ch = (e & f) ^ (~e & g);
            const temp1 = _h + s1 + ch + k[j] + (w[j] | 0);

            h[7] = h[6];
            h[6] = h[5];
            h[5] = h[4];
            h[4] = (d + temp1) | 0;
            h[3] = h[2];
            h[2] = h[1];
            h[1] = h[0];
            h[0] = (temp1 + temp2) | 0;
        }

        for (j = 0; j < 8; j++) {
            h[j] = (h[j] + oldH[j]) | 0;
        }
    }

    for (i = 0; i < 8; i++) {
        for (j = 3; j >= 0; j--) {
            const byte = (h[i] >> (j * 8)) & 0xff;
            result += (byte < 16 ? '0' : '') + byte.toString(16);
        }
    }
    return result;
}

export interface PowSolution {
    powNonce: string;
    powTimestamp: number;
}

/**
 * Solve the SHA-256 Proof of Work puzzle synchronously.
 * It loops nonces in a simple while loop. Since the prefix difficulty
 * is 4 leading zeros (hex), it requires around ~65k hashes on average,
 * which takes ~15-40ms in modern JS engines.
 *
 * @param email - User's email to bind the puzzle to (prevents reuse across accounts)
 */
export function solvePow(email: string): PowSolution {
    const powTimestamp = Date.now();
    let nonce = 0;
    const emailLower = email.toLowerCase();

    while (true) {
        const powNonce = nonce.toString();
        const data = emailLower + powTimestamp.toString() + powNonce;
        const hash = sha256Sync(data);
        if (hash.startsWith('0000')) {
            return { powNonce, powTimestamp };
        }
        nonce++;
    }
}
