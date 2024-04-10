const { SlashCommandBuilder } = require('discord.js');
const { UserLevel } = require('../../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('togglexp')
        .setDescription('Toggles your XP gain on or off.'),
        category: 'general',
    async execute(interaction) {
        const user_id = interaction.user.id;

        // Fetch the user's current XP settings
        let userSettings = await UserLevel.findOne({ where: { user_id } });

        if (!userSettings) {
            userSettings = await UserLevel.create({ 
                user_id: user_id, 
                user_name: interaction.user.username, 
                xp: 0, 
                level: 1, 
                xp_enabled: false 
            });
            await interaction.reply({ content: "You didn't have any XP settings before, so I've disabled XP gain for you.", ephemeral: true });
        } else {
            // Toggle the xp_enabled flag
            userSettings.xp_enabled = !userSettings.xp_enabled;
            await userSettings.save();

            const xpStatus = userSettings.xp_enabled ? "enabled" : "disabled";
            await interaction.reply({ content: `XP gain has been ${xpStatus}.`, ephemeral: true });
        }
    },
};
