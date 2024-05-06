module.exports = (sequelize, DataTypes) => {
    const TempBan = sequelize.define('TempBan', {
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
        issuerName: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: "The username of the user who issued the ban",
        },
        reason: {
            type: DataTypes.TEXT,
            allowNull: true, // Reason might be optional
            comment: "The reason for the ban",
        },
        duration: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: "The duration of the temporary ban (e.g., '1d', '2d', '5d', '7d')"
        },
        date: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            comment: "The date and time when the ban was issued",
        },
        unbanDate: {
            type: DataTypes.DATE,
            allowNull: false,
            comment: "The scheduled date and time when the ban will be lifted",
        }
    }, {
        timestamps: false,
    });

    return TempBan;
};
