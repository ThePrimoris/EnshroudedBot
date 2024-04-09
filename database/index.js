const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

// Initialize Sequelize with SQLite
const sequelize = new Sequelize('sqlite:mydatabase.db');

/* Dedicated database for MySQL
const sequelize = new Sequelize('database_name', 'username', 'password', {
  host: 'hostname',
  dialect: 'mysql',
}); */

// Import models
const UserWarning = require('./models/UserWarning')(sequelize, DataTypes);
const UserNote = require('./models/UserNote')(sequelize, DataTypes);
const UserLevel = require('./models/UserLevel')(sequelize, DataTypes); // Make sure this is updated to include the optOutXP field
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

// Function to add XP and handle leveling up, now checks for opt-out
async function addXP(userId, xpToAdd) {
  if (cooldown.has(userId)) return; // Enforce cooldown
  cooldown.add(userId);
  setTimeout(() => cooldown.delete(userId), 60000); // 1 minute cooldown

  let user = await UserLevel.findByPk(userId);
  if (!user) {
    user = await UserLevel.create({ user_id: userId, xp: 0, level: 1 }); // Create with defaults if not exist
  }

  // New check: Skip XP addition if the user has opted out
  if (user.optOutXP) {
    console.log(`User ${userId} has opted out of gaining XP.`);
    return; // Exit without adding XP
  }

  let newXp = user.xp + xpToAdd;
  let newLevel = Math.floor(0.1 * Math.sqrt(newXp)); // Your leveling logic

  // Update user's XP and level, assuming you handle level calculation elsewhere or as shown
  await user.update({ xp: newXp, level: newLevel });

  // Example: notify about leveling up, adjust according to your actual logic
  if (newLevel > user.level) {
    console.log(`User ${userId} leveled up to ${newLevel}!`);
  }
}

module.exports = {
  sequelize,
  UserWarning,
  UserNote,
  UserLevel,
  UserMute,
  UserBan,
  addXP,
};
