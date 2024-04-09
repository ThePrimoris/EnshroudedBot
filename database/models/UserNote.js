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
        date: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            comment: "The date when the note was created",
        },
        issuerId: { // Replacing createdBy with issuerId
            type: DataTypes.STRING,
            allowNull: false,
            comment: "The ID of the user who issued the note",
        },
        issuerName: { // Additional field for storing issuer's name
            type: DataTypes.STRING,
            allowNull: false,
            comment: "The username of the user who issued the note",
        },
    }, {
        timestamps: false,
    });
  
    return UserNote;
  };
  