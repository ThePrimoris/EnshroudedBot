const envFile = `.env.${process.argv[2] || 'dev'}`;
require('dotenv').config({ path: envFile });
const Sequelize = require('sequelize');
const fs = require('fs');
const path = require('path');
const DataTypes = Sequelize.DataTypes;

// Ensure the logs directory exists
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Create a writable stream to log errors to a file in the logs directory
const logStream = fs.createWriteStream(path.join(logsDir, 'sequelize-errors.log'), { flags: 'a' });

// Custom logging function
function customLogger(msg) {
  if (msg.includes('ERROR')) {
    // Log only error messages
    console.error(msg);  // Log to console
    logStream.write(`${msg}\n`);  // Log to file
  }
}

// Dedicated database for MySQL
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  logging: customLogger,  // Use custom logging function
});

// Import models
const UserWarning = require('./models/UserWarning')(sequelize, DataTypes);
const UserNote = require('./models/UserNote')(sequelize, DataTypes);
const UserMute = require('./models/UserMute')(sequelize, DataTypes);
const UserBan = require('./models/UserBan')(sequelize, DataTypes);
const TempBan = require('./models/TempBan')(sequelize, DataTypes);

// Sync database and log success/error
const syncDb = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('Database and tables created/updated!');
  } catch (error) {
    console.error('Failed to sync database:', error);
    logStream.write(`ERROR: Failed to sync database: ${error.message}\n`);
  }
};

syncDb();

module.exports = {
  sequelize,
  UserWarning,
  UserNote,
  UserMute,
  UserBan,
  TempBan,
};
