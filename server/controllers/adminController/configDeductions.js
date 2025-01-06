const fs = require('fs');
const dotenv = require('dotenv');
const path = require('path');

// Define the path to .env file
const envPath = path.resolve(__dirname, '../../.env'); // Adjust the path as necessary

// Initial load of environment variables
dotenv.config({ path: envPath });

/**
 * Helper function to set or update a key-value pair in .env content
 */
const setEnvVariable = (envContent, key, value) => {
  const regex = new RegExp(`^${key}=.*$`, 'm');
  if (envContent.match(regex)) {
    return envContent.replace(regex, `${key}=${value}`);
  } else {
    // Ensure there's a newline before adding new variables
    return envContent.endsWith('\n') ? `${envContent}${key}=${value}` : `${envContent}\n${key}=${value}`;
  }
};

/**
 * @desc    Get the current deductions settings from environment variables
 * @route   GET /admin/getDeductions
 * @access  Admin
 */
exports.getDeductions = async (req, res) => {
  try {
    // Parse DEDUCTIONS_ENABLED as boolean
    const deductionsEnabled = process.env.DEDUCTIONS_ENABLED === 'true';
    const deductionRate = parseFloat(process.env.DEDUCTION_RATE) || 0;

    console.log("Current DEDUCTIONS_ENABLED:", deductionsEnabled);
    console.log("Current DEDUCTION_RATE:", deductionRate);

    res.status(200).json({ deductionsEnabled, deductionRate });
  } catch (error) {
    console.error("Error fetching deductions settings:", error.message);
    res.status(500).json({ message: "Failed to fetch deductions settings", error: error.message });
  }
};

/**
 * @desc    Update deductions settings in the .env file
 * @route   PUT /admin/updateDeductions
 * @access  Admin
 */
exports.updateDeductions = async (req, res) => {
  const { deductionsEnabled, deductionRate } = req.body;

  // Validate input types
  if (typeof deductionsEnabled !== "boolean" || typeof deductionRate !== "number") {
    return res.status(400).json({ message: "Invalid data types for deductionsEnabled or deductionRate." });
  }

  try {
    // Read the current .env content
    let envContent = fs.readFileSync(envPath, 'utf8');

    // Update or add DEDUCTIONS_ENABLED
    envContent = setEnvVariable(envContent, 'DEDUCTIONS_ENABLED', deductionsEnabled ? 'true' : 'false');

    // Update or add DEDUCTION_RATE
    envContent = setEnvVariable(envContent, 'DEDUCTION_RATE', deductionRate.toString());

    // Write the updated content back to the .env file
    fs.writeFileSync(envPath, envContent, { encoding: 'utf8' });

    console.log("Updated DEDUCTIONS_ENABLED and DEDUCTION_RATE in .env");

    // Reload environment variables with override to apply changes immediately
    dotenv.config({ path: envPath, override: true });

    // Verify the update
    console.log("After update, DEDUCTIONS_ENABLED:", process.env.DEDUCTIONS_ENABLED);
    console.log("After update, DEDUCTION_RATE:", process.env.DEDUCTION_RATE);

    res.status(200).json({ message: "Deductions settings updated successfully." });
  } catch (error) {
    console.error("Error updating deductions settings:", error.message);
    res.status(500).json({ message: "Failed to update deductions settings", error: error.message });
  }
};
