const AdminModel = require("../models/Admin");
const jwt = require('jsonwebtoken');

exports.login= async (req, res) => {
    const { email, password } = req.body;
    //    const token= jwt.sign({id:user._id}, process.env.JWT_SECRET)
    const JWT_SECRET = process.env.JWT_SECRET;

    try {
        console.log("Received credentials:", { email, password });

        const admin = await AdminModel.findOne({ email: email });
        console.log("Query result:", admin);

        if (!admin) {
            console.log("No admin found for email:", email);
        } else if (admin.password !== password) {
            console.log("Password mismatch");
        }

        if (!admin || admin.password !== password) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
        const token = jwt.sign({ id: admin._id, email: admin.email }, JWT_SECRET,
            // expiresIn: "1h", // Token expires in 1 hour
        );
        res.status(200).json({ message: "Login successful", token });
    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ message: "Server error", error });
    }
};