const admin = require('firebase-admin');
const path = require('path');

let serviceAccount;
try {
    serviceAccount = require('./serviceAccountKey.json');
} catch (e) {
    console.log("No serviceAccountKey.json found, checking environment variables...");
}

if (!admin.apps.length) {
    if (serviceAccount) {
        console.log("Initializing Firebase Admin with serviceAccountKey.json");
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    } else {
        console.log("Initializing Firebase Admin with Default Credentials");
        admin.initializeApp({
            credential: admin.credential.applicationDefault()
        });
    }
}

module.exports = admin;
