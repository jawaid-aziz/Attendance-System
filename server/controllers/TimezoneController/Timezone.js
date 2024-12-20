// controllers/TimezoneController/Timezone.js

const fs = require('fs');
const dotenv = require('dotenv');

// Load the existing .env file into process.env
dotenv.config();

/**
 * @desc    Get the current timezone from environment variables
 * @route   GET /api/timezone
 * @access  Public
 */
exports.getTimezone = async (req, res) => {
  try {
    // Retrieve the current timezone from process.env
    // If not set, default to 'UTC'
    const currentTimezone = process.env.TIMEZONE || 'UTC';

    // Send the timezone as a JSON response
    res.status(200).json({ timezone: currentTimezone });
  } catch (error) {
    // Log any errors and send a 500 response
    console.error('Error retrieving timezone:', error.message);
    res.status(500).json({ message: 'Failed to retrieve timezone', error: error.message });
  }
};

/**
 * @desc    Update the timezone and persist it in the .env file
 * @route   PUT /api/timezone
 * @access  Public
 */
exports.updateTimezone = async (req, res) => {
  const { timezone } = req.body;

  // Validate that a timezone was provided in the request body
  if (!timezone) {
    return res.status(400).json({ message: 'Timezone is required.' });
  }

  try {
    // Define the path to the .env file
    const envPath = './.env';

    // Read the current contents of the .env file
    let envContent = fs.readFileSync(envPath, 'utf8');

    // Check if the TIMEZONE variable already exists in the .env file
    if (envContent.includes('TIMEZONE=')) {
      // If it exists, replace the existing TIMEZONE value with the new one
      envContent = envContent.replace(/TIMEZONE=.*/, `TIMEZONE=${timezone}`);
    } else {
      // If it does not exist, append the TIMEZONE variable to the end of the .env file
      envContent += `\nTIMEZONE=${timezone}`;
    }

    // Write the updated contents back to the .env file
    fs.writeFileSync(envPath, envContent);

    // Update the in-memory process.env.TIMEZONE to reflect the new value
    process.env.TIMEZONE = timezone;

    // Send a success response with the updated timezone
    res.status(200).json({ message: 'Timezone updated successfully.', timezone });

    // Log the successful update to the console
    console.log(`Timezone updated to: ${timezone}`);
  } catch (error) {
    // Log any errors and send a 500 response
    console.error('Error updating timezone:', error.message);
    res.status(500).json({ message: 'Failed to update timezone', error: error.message });
  }
};
