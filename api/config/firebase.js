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
            // Clean up the string in case it's wrapped in extra quotes or has bad spacing
            let cleanJson = envConfig.trim();

            // If it's wrapped in single quotes, strip them (common copy-paste error)
            if (cleanJson.startsWith("'") && cleanJson.endsWith("'")) {
                cleanJson = cleanJson.substring(1, cleanJson.length - 1);
            }

            serviceAccount = JSON.parse(cleanJson);

            // Ensure private_key is correctly formatted
            if (serviceAccount.private_key) {
                // Remove literal \n and replace with actual newlines if needed
                serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
            }

            console.log('Firebase Service Account parsed successfully. Project ID:', serviceAccount.project_id);
        } catch (err) {
            console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT. Input length:', envConfig.length);
            console.error('Parsing error:', err.message);
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
