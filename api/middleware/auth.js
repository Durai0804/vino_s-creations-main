/**
 * Simple middleware to verify the manual admin password.
 */
const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized: No password provided' });
        }

        const password = authHeader.split('Bearer ')[1];

        // List of valid passwords for admins
        const validPasswords = ['V9514773265p', 'Rasukutty0804'];

        if (!validPasswords.includes(password)) {
            return res.status(401).json({ error: 'Unauthorized: Invalid password' });
        }

        next();
    } catch (error) {
        console.error('Auth middleware error:', error.message);
        return res.status(401).json({ error: 'Unauthorized: System error during verification' });
    }
};

module.exports = authMiddleware;
