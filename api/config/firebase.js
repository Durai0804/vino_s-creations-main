const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

let serviceAccount;

// Try to load from local file first (for local dev)
const localKeyPath = path.join(__dirname, '../../vino-s-creation-5e2acd327ff6.json');

if (fs.existsSync(localKeyPath)) {
    serviceAccount = require(localKeyPath);
    console.log('Firebase: Loaded from local JSON file');
} else {
    // Use INDIVIDUAL environment variables (most reliable for Vercel)
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (projectId && clientEmail && privateKey) {
        serviceAccount = {
            type: 'service_account',
            project_id: projectId,
            client_email: clientEmail,
            // Vercel stores \n as literal \\n, so we fix it here
            private_key: privateKey.replace(/\\n/g, '\n'),
        };
        console.log('Firebase: Loaded from individual env vars. Project ID:', projectId);
    } else {
        console.error('Firebase ERROR: Missing FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, or FIREBASE_PRIVATE_KEY env vars');
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
        console.log('Firebase: Firestore connected successfully');
    }
} catch (err) {
    console.error('Firestore init error:', err.message);
}

module.exports = { admin, db };
