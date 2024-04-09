module.exports = (sequelize, DataTypes) => {
  const UserWarning = sequelize.define('UserWarning', {
      userId: {
          type: DataTypes.STRING,
          allowNull: false,
          comment: "The ID of the user the warning is associated with",
      },
      issuerId: {
          type: DataTypes.STRING,
          allowNull: false,
          comment: "The ID of the user who issued the warning",
      },
      issuerName: {
          type: DataTypes.STRING,
          allowNull: false,
          comment: "The username of the user who issued the warning",
      },
      reason: {
          type: DataTypes.TEXT,
          allowNull: true, // Reason might be optional
          comment: "The reason for the warning",
      },
      date: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
          comment: "The date and time when the warning was issued",
      },
  }, {
      timestamps: false,
  });

  return UserWarning;
};
