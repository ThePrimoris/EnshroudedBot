module.exports = (sequelize, DataTypes) => {
    const CustomCommand = sequelize.define('CustomCommand', {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            comment: "The unique name of the custom command",
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: "The title of the embed for the custom command",
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
            comment: "The description of the embed for the custom command",
        }
        // Add more fields as necessary
    }, {
        timestamps: false, // Assuming you don't need createdAt/updatedAt for custom commands
    });

    return CustomCommand;
};
