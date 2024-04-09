const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

// Initialize Sequelize with SQLite
const sequelize = new Sequelize('sqlite:mydatabase.db');

// Import models
const UserWarning = require('./models/UserWarning')(sequelize, DataTypes);
const UserNote = require('./models/UserNote')(sequelize, DataTypes);
const UserLevel = require('./models/UserLevel')(sequelize, DataTypes);
const UserMute = require('./models/UserMute')(sequelize, DataTypes);
const UserBan = require('./models/UserBan')(sequelize, DataTypes);
const CensoredWord = require('./models/CensoredWord')(sequelize, DataTypes);

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

// Function to add XP and handle leveling up
async function addXP(userId, xpToAdd) {
  if (cooldown.has(userId)) return; // Check cooldown
  cooldown.add(userId);
  setTimeout(() => cooldown.delete(userId), 60000); // 1 minute cooldown

  let user = await UserLevel.findByPk(userId);
  if (!user) {
      // Ensure correct initial values are set
      user = await UserLevel.create({ user_id: userId, xp: 0, level: 1 });
  }

  let newXp = user.xp + xpToAdd;
  
  // Use the updated formula to calculate the new level
  let newLevel = Math.min(Math.floor(Math.sqrt(newXp / 10)), 25); // Updated formula here

  await user.update({ xp: newXp, level: newLevel }); // Update user's XP and level

  if (newLevel > user.level) { // If the user has leveled up
      console.log(`User ${userId} leveled up to ${newLevel}!`); // Placeholder for level-up notification
      // Implement notification logic here, e.g., sending a DM to the user
  }
}

module.exports = {
  sequelize,
  UserWarning,
  UserNote,
  UserLevel,
  UserMute,
  UserBan,
  CensoredWord,
  addXP,
};
