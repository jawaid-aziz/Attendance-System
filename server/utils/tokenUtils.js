const jwt=require("jsonwebtoken") 
// Function to generate a token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role }, // Payload
    process.env.JWT_SECRET, // Secret key from environment variables
    { expiresIn: '1h' } // Token expi ration time
  );
};

module.exports ={generateToken}