const jwt = require("jsonwebtoken");

exports.verifyAdmin = (req, res, next) => {
    // const token = req.headers.authorization;
    const token = req.headers.authorization?.split(" ")[1]; // Extract the token
    console.log("Token received:", token); // Debugging
    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Chec if the role is 'admin'
        if (decoded.role !== "admin") {
            return res.status(403).json({ message: "Access denied. Admins only." });
        }

        // Attach user data to the request object
        req.user = decoded;

        // Continue to the next middleware or route handler
        next();
    } catch (error) {
        console.error("Token verification failed:", error);
        return res.status(400).json({ message: "Invalid token." });
    }
};
