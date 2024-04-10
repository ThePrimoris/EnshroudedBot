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

const cooldown = new Set();

const syncDb = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('Database and tables created/updated!');
  } catch (error) {
    console.error('Failed to sync database:', error);
  }
};

syncDb();

// Function to calculate level based on XP
function calculateLevel(xp) {
  return Math.floor(Math.sqrt(xp / 100));
}

// Function to add XP and handle leveling up
async function addXP(userId, xpToAdd) {
  if (cooldown.has(userId)) return; // Enforce cooldown
  cooldown.add(userId);
  setTimeout(() => cooldown.delete(userId), 60000); // 1 minute cooldown

  let user = await UserLevel.findByPk(userId);
  if (!user) {
    user = await UserLevel.create({ user_id: userId, xp: 0, level: 1 });
  }

  if (user.optOutXP) {
    console.log(`User ${userId} has opted out of gaining XP.`);
    return;
  }

  let newXp = user.xp + xpToAdd;
  let newLevel = calculateLevel(newXp);

  await user.update({ xp: newXp, level: newLevel });

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
