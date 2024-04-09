module.exports = (sequelize, DataTypes) => {
    return sequelize.define('UserLevel', {
        user_id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        xp: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        level: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
        },
        class: {
            type: DataTypes.STRING,
            defaultValue: '',
            allowNull: true,
        },
    }, {
        timestamps: false,
    });
};
