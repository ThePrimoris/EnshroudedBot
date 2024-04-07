const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mban')
        .setDescription('Ban multiple users from the server.')
        .addStringOption(option =>
            option.setName('userids')
                .setDescription('The user IDs to be banned, separated by spaces.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('The reason for the ban.')
                .setRequired(true)),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return interaction.reply({ content: "You do not have permission to use this command.", ephemeral: true });
        }

        const userIdsString = interaction.options.getString('userids');
        const reason = interaction.options.getString('reason');
        const userIds = userIdsString.split(' ').filter(id => !isNaN(id) && id);

        if (userIds.length === 0) {
            return interaction.reply({ content: "No valid user IDs provided.", ephemeral: true });
        }

        for (const userId of userIds) {
            try {
                await interaction.guild.members.ban(userId, { reason });
                // Optional: Log each ban to the console or a log file
            } catch (error) {
                console.error(`Failed to ban user with ID ${userId}:`, error);
                // Continue to the next ID without stopping the loop
            }
        }

        await interaction.reply({ content: `Banning process completed for provided IDs.`, ephemeral: false });
    },
};
