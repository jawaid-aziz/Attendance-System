const fs = require("fs");
const path = require("path");
const dotenv= require("dotenv")
const ENV_FILE_PATH = path.resolve(__dirname, "../../.env");

// Helper to read/write .env file
const updateEnvFile = (key, value) => {
  const envData = fs.readFileSync(ENV_FILE_PATH, "utf8");
  const envVars = envData.split("\n").filter((line) => line.trim());

  const newEnvVars = envVars.map((line) => {
    if (line.startsWith(`${key}=`)) {
      return `${key}=${value}`;
    }
    return line;
  });

  if (!newEnvVars.some((line) => line.startsWith(`${key}=`))) {
    newEnvVars.push(`${key}=${value}`);
  }

  fs.writeFileSync(ENV_FILE_PATH, newEnvVars.join("\n"), "utf8");
};

// Get office schedule from .env file
const getOfficeSchedule = (req, res) => {
  const officeSchedule = process.env.OFFICE_SCHEDULE || "{}";
  res.json(JSON.parse(officeSchedule));
};

// Save office schedule to .env file
const saveOfficeSchedule = (req, res) => {
    const { schedule } = req.body;
  
    if (!schedule || typeof schedule !== "object") {
      return res.status(400).json({ message: "Invalid schedule data." });
    }
  
    try {
      const scheduleString = JSON.stringify(schedule);
  
      const updateEnvFile = (key, value) => {
        const envVars = fs.existsSync(ENV_FILE_PATH)
          ? dotenv.parse(fs.readFileSync(ENV_FILE_PATH))
          : {};
        envVars[key] = value;
        fs.writeFileSync(
          ENV_FILE_PATH,
          Object.entries(envVars)
            .map(([k, v]) => `${k}=${v}`)
            .join("\n"),
          "utf8"
        );
      };
  
      updateEnvFile("OFFICE_SCHEDULE", scheduleString);
      process.env.OFFICE_SCHEDULE = scheduleString;
  
      res.json({ message: "Office schedule updated successfully." });
    } catch (error) {
      console.error("Error saving office schedule:", error);
      res.status(500).json({ message: "Failed to save office schedule." });
    }
  };
  

module.exports = { getOfficeSchedule, saveOfficeSchedule };
