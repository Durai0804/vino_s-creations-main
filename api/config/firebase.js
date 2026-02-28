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
            console.log('Attempting to parse FIREBASE_SERVICE_ACCOUNT...');
            let cleanJson = envConfig.trim();

            // Strip any surrounding quotes (single or double)
            if ((cleanJson.startsWith("'") && cleanJson.endsWith("'")) ||
                (cleanJson.startsWith('"') && cleanJson.endsWith('"'))) {
                cleanJson = cleanJson.substring(1, cleanJson.length - 1);
            }

            // Initial parse
            serviceAccount = JSON.parse(cleanJson);

            // If the result is somehow still a string, parse it again (recursive parsing)
            while (typeof serviceAccount === 'string') {
                console.log('Result was a string, parsing again...');
                serviceAccount = JSON.parse(serviceAccount);
            }

            if (serviceAccount && typeof serviceAccount === 'object') {
                console.log('Parsed Keys:', Object.keys(serviceAccount));

                // Fix private_key format if present
                if (serviceAccount.private_key) {
                    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
                }

                if (serviceAccount.project_id) {
                    console.log('Successfully identified Project ID:', serviceAccount.project_id);
                } else {
                    console.error('CRITICAL: project_id MISSING in parsed object!');
                }
            } else {
                console.error('CRITICAL: Parsed result is NOT an object! Type:', typeof serviceAccount);
            }
        } catch (err) {
            console.error('FAILED to parse FIREBASE_SERVICE_ACCOUNT JSON!');
            console.error('Error:', err.message);
            console.error('First 50 chars of input:', envConfig.substring(0, 50));
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
