module.exports = (sequelize, DataTypes) => {
    const UserInfraction = sequelize.define('UserInfraction', {
      // Model attributes are defined here
      userId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      reason: {
        type: DataTypes.TEXT,
        allowNull: true, // Consider your own requirements
      },
      date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      issuerName: {
        type: DataTypes.STRING,
        allowNull: true, // or false, based on your requirements
      },
      // You can add more fields here as needed
    }, {
      // Model options go here
      timestamps: false, // Turn off Sequelize's automatic timestamping if you don't need it
    });
  
    return UserInfraction;
  };
  