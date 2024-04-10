module.exports = (sequelize, DataTypes) => {
    const UserLevel = sequelize.define('UserLevel', {
        user_id: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            primaryKey: true,
            comment: "The Discord ID of the user",
        },
        user_name: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: "The user's Discord name or nickname",
        },
        xp: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false,
            comment: "The total amount of experience points the user has accumulated",
        },
        level: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
            allowNull: false,
            comment: "The user's current level based on the accumulated XP",
        },
    }, {
        timestamps: false,
    });

    return UserLevel;
};
