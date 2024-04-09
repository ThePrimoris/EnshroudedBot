module.exports = (sequelize, DataTypes) => {
    const UserMute = sequelize.define('UserMute', {
        userId: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: "The ID of the user the mute is associated with",
        },
        issuerId: { // Use issuerId for storing the ID of the issuer
            type: DataTypes.STRING,
            allowNull: false,
            comment: "The ID of the user who issued the mute",
        },
        issuerName: { // Add issuerName to store the name of the issuer
            type: DataTypes.STRING,
            allowNull: false,
            comment: "The username of the user who issued the mute",
        },
        reason: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: "The reason for the mute",
        },
        duration: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: "The duration of the mute, e.g., '10m', '1h', '3d'",
        },
        date: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            comment: "The date and time when the mute was issued",
        },
    }, {
        timestamps: false,
    });

    return UserMute;
};
