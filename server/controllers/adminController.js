
const employeeModel = require("../models/Employee");
const userModel = require("../models/User");
// const bcrypt = require("bcryptjs");

// Add User
exports.addUser = async (req, res) => {
  const { firstName, lastName, role, email, phone, salary, address,password } = req.body;
  try {
    // validation for input fields
    if(!role ) 
        return res.status(400).json({message:"role is required"});
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }
    if (!firstName || !lastName) {
        return res.status(400).json({ message: "first name and last name are required" });
    }
    if (!phone || !salary) {
        return res.status(400).json({ message: "phone and salary are required" });
    }
    if (!address) {
        return res.status(400).json({ message: "Address is required." });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email format" });
    }
    const nameRegex = /^[a-zA-Z\s]{2,50}$/;
    if (!nameRegex.test(firstName) || !nameRegex.test(lastName)) {
        return res.status(400).json({
            message: "Names must contain only letters and spaces, and be 2 to 50 characters long.",
        });
    }
    const phoneRegex = /^\d{10,15}$/;
    if (!phoneRegex.test(phone)) {
        return res.status(400).json({
            message: "Invalid phone number format. It should contain 10 to 15 digits only.",
        });
    }
    if (isNaN(salary) || salary <= 0) {
        return res.status(400).json({
            message: "Invalid salary format. Salary must be a positive number.",
        });
    }
    if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    const existingUser = await employeeModel.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    // const hashedPassword = await bcrypt.hash("defaultPassword123", 10); // Default password
    // new employee in employees collection
    const newEmployee = await employeeModel.create({ firstName, lastName,role, email, phone, salary, address, password });
    console.log("Employee added:", newEmployee);
    
// reference of employee in user collection for employee login
 const newUser= await userModel.create({role,email, password});
    console.log("user/employee created/added in User collection", newUser);
    res.status(201).json({ message: "User added successfully" });
  } catch (error) {
    console.log("error in adding employee:",error)
    res.status(500).json({ message: "Failed to add user", error: error.message });
  }
};

// User Login
// exports.loginUser = async (req, res) => {
//   const { email, password } = req.body;
//   try {
//     const user = await User.findOne({ email });
//     if (!user) return res.status(404).json({ message: "User not found" });

//     const isPasswordValid = await compare(password, user.password);
//     if (!isPasswordValid) return res.status(401).json({ message: "Invalid credentials" });

//     res.status(200).json({ message: "Login successful", user });
//   } catch (error) {
//     res.status(500).json({ message: "Failed to login", error: error.message });
//   }
// };
