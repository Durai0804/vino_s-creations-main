const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

let serviceAccount;

// Try to load from local file first (for local dev)
const localKeyPath = path.join(__dirname, '../../vino-s-creation-5e2acd327ff6.json');

if (fs.existsSync(localKeyPath)) {
    serviceAccount = require(localKeyPath);
} else {
    // Fallback to environment variable (for Vercel)
    const envConfig = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (envConfig) {
        try {
            // Vercel sometimes passes the JSON string with escaped newlines.
            // We'll clean it up to ensure valid JSON parsing.
            const cleanJson = envConfig.trim();
            serviceAccount = JSON.parse(cleanJson);

            // Fix double-escaped newlines in private_key if they exist
            if (serviceAccount.private_key) {
                serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
            }
        } catch (err) {
            console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT env var:', err.message);
        }
    }
}

if (!admin.apps.length && serviceAccount) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

let db;
try {
    if (admin.apps.length > 0) {
        db = admin.firestore();
    }
} catch (err) {
    console.error('Firestore init error:', err.message);
}

module.exports = { admin, db };
