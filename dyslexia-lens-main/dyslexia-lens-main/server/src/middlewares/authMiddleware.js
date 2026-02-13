const admin = require('../config/firebase');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // get token from header
            token = req.headers.authorization.split(' ')[1];
            // console.log("Middleware received token:", token ? token.substring(0, 20) + "..." : "null");

            // verify firebase token
            const decodedToken = await admin.auth().verifyIdToken(token);
            const { uid, email, name, picture } = decodedToken;

            // find or create user in postgres
            let user = await prisma.user.findUnique({
                where: { email: email } // link by email
            });

            if (!user) {
                // check by firebaseuid if email changed (unlikely for google auth but good practice)
                // actually, let's just create if not found by email. 
                // we should also check if user exists but has no firebaseuid (legacy user being migrated)

                // if user doesn't exist, create one
                user = await prisma.user.create({
                    data: {
                        email: email,
                        firebaseUid: uid,
                        name: name || email.split('@')[0],
                        // password is optional now
                    }
                });
            } else if (!user.firebaseUid) {
                // link existing user to firebase
                user = await prisma.user.update({
                    where: { id: user.id },
                    data: { firebaseUid: uid }
                });
            }

            req.user = user;
            next();
        } catch (error) {
            console.error('Auth Error:', error);
            res.status(401).json({ message: 'Not authorized, invalid token' });
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};
