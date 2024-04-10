const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

// Dedicated database for MySQL
const sequelize = new Sequelize(process.env.DATABASE_URL);

// Import models
const UserWarning = require('./models/UserWarning')(sequelize, DataTypes);
const UserNote = require('./models/UserNote')(sequelize, DataTypes);
const UserMute = require('./models/UserMute')(sequelize, DataTypes);
const UserBan = require('./models/UserBan')(sequelize, DataTypes);

// Persistent cooldown set for addXP function
const cooldown = new Set();

// Sync database and log success/error
const syncDb = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('Database and tables created/updated!');
  } catch (error) {
    console.error('Failed to sync database:', error);
  }
};

syncDb();

module.exports = {
  sequelize,
  UserWarning,
  UserNote,
  UserMute,
  UserBan,
  addXP,
};
