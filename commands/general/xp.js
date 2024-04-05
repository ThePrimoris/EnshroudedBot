const { SlashCommandBuilder } = require('@discordjs/builders');
const { UserLevel } = require('../../database/index.js');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('xp')
        .setDescription('Check your XP and level!'),

    async execute(interaction) {
        try {
            const userId = interaction.user.id;

            // Retrieve user's XP and level from the database
            const userLevel = await UserLevel.findByPk(userId);

            if (userLevel) {
                await interaction.reply({
                    content: `You have ${userLevel.xp} XP and are at level ${userLevel.level}.`,
                    ephemeral: true
                });
            } else {
                await interaction.reply({
                    content: "Couldn't retrieve your XP and level. Please try again later.",
                    ephemeral: true
                });
            }
        } catch (error) {
            console.error('Error executing /xp command:', error);
            await interaction.reply({
                content: 'An error occurred while processing your command. Please try again later.',
                ephemeral: true
            });
        }
    }
};
