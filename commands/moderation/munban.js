const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('munban')
        .setDescription('Unban multiple users from the server.')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.BanMembers)
        .addStringOption(option =>
            option.setName('user_ids')
                .setDescription('The IDs of the users to unban, separated by spaces.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('The reason for the unban.')
                .setRequired(true)),
    requiredPermissions: ['BanMembers'],
    category: 'moderation',
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return interaction.reply({ content: "You don't have permission to use this command.", ephemeral: true });
        }

        const userIdsString = interaction.options.getString('user_ids');
        const reason = interaction.options.getString('reason');
        const userIds = userIdsString.split(' ').filter(id => id.trim().length > 0);

        if (userIds.length === 0) {
            return interaction.reply({ content: "No valid user IDs provided.", ephemeral: true });
        }

        const failedUnbans = [];

        for (const userId of userIds) {
            try {
                await interaction.guild.members.unban(userId, reason);
            } catch (error) {
                console.error(`Failed to unban user with ID ${userId}:`, error);
                failedUnbans.push(userId);
            }
        }

        let replyMessage = `Unban process completed.`;
        if (failedUnbans.length > 0) {
            replyMessage += ` Failed to unban IDs: ${failedUnbans.join(', ')}.`;
        }

        await interaction.reply({ content: replyMessage, ephemeral: false });
    },
};
