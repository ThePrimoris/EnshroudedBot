const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

// Create a sequelize instance for a SQLite database
// Adjust the database connection settings as necessary
const sequelize = new Sequelize('sqlite:mydatabase.db');

// Import models
const UserInfraction = require('./models/UserInfraction')(sequelize, DataTypes);
const UserNote = require('./models/UserNote')(sequelize, DataTypes);

// Sync all models with the database
const syncDb = async () => {
  try {
    await sequelize.sync({ alter: true }); // Use { alter: true } for development to update tables based on model changes. Use { force: true } to drop and recreate tables. Be careful with these options in production.
    console.log('Database and tables created/updated!');
  } catch (error) {
    console.error('Failed to sync database:', error);
  }
};

// Immediately invoke the sync function if you prefer to sync on startup
syncDb();

module.exports = {
  sequelize, // Exporting the sequelize instance is optional but can be useful
  UserInfraction,
  UserNote,
};
