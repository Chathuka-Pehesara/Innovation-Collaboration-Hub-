const crypto = require('crypto');
const axios = require('axios');

const API_LOGIN_URL = 'http://localhost:5000/api/auth/login';

// Synchronous SHA-256 solver matching the frontend/backend impl
function sha256Sync(ascii) {
    return crypto.createHash('sha256').update(ascii).digest('hex');
}

function solvePow(email) {
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

async function runTests() {
    console.log('🧪 Starting Security Verification Tests...\n');
    const testEmail = 'dev-test@example.com';
    const testPassword = 'Password123';

    // Test Case 1: Missing PoW details
    try {
        console.log('Test Case 1: Sending request without PoW parameters...');
        await axios.post(API_LOGIN_URL, {
            email: testEmail,
            password: testPassword,
        });
        console.error('❌ FAIL: Request without PoW parameters succeeded unexpectedly.');
    } catch (err) {
        if (err.response && err.response.status === 400 && err.response.data.code === 'POW_MISSING') {
            console.log('✅ PASS: Server blocked request with POW_MISSING (400).');
        } else {
            console.error('❌ FAIL: Expected 400 POW_MISSING, got:', err.response ? `${err.response.status} ${JSON.stringify(err.response.data)}` : err.message);
        }
    }
    console.log('--------------------------------------------------');

    // Test Case 2: Honeypot field filled
    try {
        console.log('Test Case 2: Sending request with Honeypot field (website) populated...');
        const { powNonce, powTimestamp } = solvePow(testEmail);
        await axios.post(API_LOGIN_URL, {
            email: testEmail,
            password: testPassword,
            powNonce,
            powTimestamp,
            website: 'http://bot-attacker.com',
        });
        console.error('❌ FAIL: Request with Honeypot field succeeded unexpectedly.');
    } catch (err) {
        if (err.response && err.response.status === 403 && err.response.data.code === 'HONEYPOT_TRIGGERED') {
            console.log('✅ PASS: Server blocked request with HONEYPOT_TRIGGERED (403).');
        } else {
            console.error('❌ FAIL: Expected 403 HONEYPOT_TRIGGERED, got:', err.response ? `${err.response.status} ${JSON.stringify(err.response.data)}` : err.message);
        }
    }
    console.log('--------------------------------------------------');

    // Test Case 3: Invalid PoW challenge solution (wrong nonce)
    try {
        console.log('Test Case 3: Sending request with invalid PoW nonce...');
        await axios.post(API_LOGIN_URL, {
            email: testEmail,
            password: testPassword,
            powNonce: '9999999999999', // Bad nonce
            powTimestamp: Date.now(),
        });
        console.error('❌ FAIL: Request with invalid PoW succeeded unexpectedly.');
    } catch (err) {
        if (err.response && err.response.status === 403 && err.response.data.code === 'POW_FAILED') {
            console.log('✅ PASS: Server blocked request with POW_FAILED (403).');
        } else {
            console.error('❌ FAIL: Expected 403 POW_FAILED, got:', err.response ? `${err.response.status} ${JSON.stringify(err.response.data)}` : err.message);
        }
    }
    console.log('--------------------------------------------------');

    // Test Case 4: Expired Timestamp PoW challenge
    try {
        console.log('Test Case 4: Sending request with expired PoW timestamp (6 minutes ago)...');
        const oldTimestamp = Date.now() - 6 * 60 * 1000;
        // Solve with old timestamp manually
        let nonce = 0;
        let powNonce = '0';
        while (true) {
            const data = testEmail.toLowerCase() + oldTimestamp.toString() + nonce.toString();
            const hash = sha256Sync(data);
            if (hash.startsWith('0000')) {
                powNonce = nonce.toString();
                break;
            }
            nonce++;
        }

        await axios.post(API_LOGIN_URL, {
            email: testEmail,
            password: testPassword,
            powNonce,
            powTimestamp: oldTimestamp,
        });
        console.error('❌ FAIL: Request with expired PoW timestamp succeeded unexpectedly.');
    } catch (err) {
        if (err.response && err.response.status === 403 && err.response.data.code === 'POW_FAILED') {
            console.log('✅ PASS: Server blocked request with expired PoW (403).');
        } else {
            console.error('❌ FAIL: Expected 403 POW_FAILED, got:', err.response ? `${err.response.status} ${JSON.stringify(err.response.data)}` : err.message);
        }
    }
    console.log('--------------------------------------------------');

    // Test Case 5: Valid PoW challenge solution (Invalid credentials check)
    try {
        console.log('Test Case 5: Sending request with valid PoW but wrong credentials...');
        const { powNonce, powTimestamp } = solvePow(testEmail);
        await axios.post(API_LOGIN_URL, {
            email: testEmail,
            password: testPassword, // Correct PoW but non-existent user
            powNonce,
            powTimestamp,
        });
        console.error('❌ FAIL: Request succeeded unexpectedly.');
    } catch (err) {
        // Should pass the PoW verification check and fail at database user lookup (401 Unauthorized)
        if (err.response && err.response.status === 401 && err.response.data.message === 'Invalid email or password.') {
            console.log('✅ PASS: PoW accepted! Server proceeded to credential validation (401).');
        } else {
            console.error('❌ FAIL: Expected 401 "Invalid email or password.", got:', err.response ? `${err.response.status} ${JSON.stringify(err.response.data)}` : err.message);
        }
    }
    console.log('--------------------------------------------------');
    console.log('🏁 All verification test runs complete!');
}

runTests();
