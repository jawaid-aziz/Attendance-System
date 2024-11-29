
const jwt = require('jsonwebtoken');

 exports.generateToken=(user)=>{
    const JWT_SECRET = process.env.JWT_SECRET;

const token = jwt.sign({ id: user._id, email: user.email, role:user.role }, JWT_SECRET,
    // expiresIn: "1h", // Token expires in 1 hour
);
return token;
 }