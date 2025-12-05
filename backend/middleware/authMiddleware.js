const jwt = require('jsonwebtoken');

const requireAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;

    // No token?
    if (!authHeader) {
        return res.status(401).json({ error: "No token provided" });
    }

    // Expecting: "Bearer tokenHere"
    const token = authHeader.split(" ")[1];

    try {
        // Verify token using secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user info to request
        req.user = decoded;

        next(); // move on to the controller
    } catch (err) {
        return res.status(403).json({ error: "Invalid or expired token" });
    }
};

module.exports = requireAuth;

