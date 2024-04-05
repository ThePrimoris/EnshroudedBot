module.exports = (sequelize, DataTypes) => {
  const UserNote = sequelize.define('UserNote', {
      userId: {
          type: DataTypes.STRING,
          allowNull: false,
          comment: "The ID of the user the note is associated with",
      },
      note: {
          type: DataTypes.TEXT,
          allowNull: false,
          comment: "The content of the note",
      },
      createdBy: {
          type: DataTypes.STRING,
          allowNull: false,
          comment: "The ID of the user who created the note",
      },
      date: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
          comment: "The date when the note was created",
      },
  }, {
      timestamps: false,
  });

  return UserNote;
};
