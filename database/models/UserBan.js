module.exports = (sequelize, DataTypes) => {
    const UserBan = sequelize.define('UserBan', {
        userId: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: "The ID of the user the ban is associated with",
        },
        issuerId: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: "The ID of the user who issued the ban",
        },
        reason: {
            type: DataTypes.TEXT,
            allowNull: true, // Reason might be optional
            comment: "The reason for the ban",
        },
        date: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            comment: "The date and time when the ban was issued",
        },
    }, {
        timestamps: false,
    });

    return UserBan;
};
