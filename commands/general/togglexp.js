const { SlashCommandBuilder } = require('discord.js');
const { UserLevel } = require('../../database/index'); // Adjust the path as necessary

module.exports = {
    data: new SlashCommandBuilder()
        .setName('togglexp')
        .setDescription('Toggle your XP gain on or off.'),
    category: 'general',
    async execute(interaction) {
        // Retrieve the user's current setting
        const userLevel = await UserLevel.findByPk(interaction.user.id);
        
        if (!userLevel) {
            // If no entry exists for the user, you might want to create one, or handle this case differently
            console.log("No user found, handling case appropriately.");
            return interaction.reply('You do not have an XP profile yet.');
        }
        
        // Toggle the optOutXP field
        userLevel.optOutXP = !userLevel.optOutXP;
        await userLevel.save(); // Save the updated model to the database
        
        // Reply to the user with their new status
        await interaction.reply(`XP gain is now ${userLevel.optOutXP ? "disabled" : "enabled"}.`);
    },
};
