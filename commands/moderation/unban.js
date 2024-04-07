const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: {
        name: 'unban',
        description: 'Unban a user from the server.',
        options: [
            {
                name: 'user_id',
                type: 'STRING',
                description: 'The ID of the user to unban.',
                required: true,
            },
            {
                name: 'reason',
                type: 'STRING',
                description: 'The reason for the unban.',
                required: true, // Updated to make reason required
            },
        ],
    },
    category: 'moderation',
    async execute(interaction) {
        // Check for BanMembers permission before proceeding with the /unban command
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return interaction.reply({ content: "You don't have permission to use this command.", ephemeral: true });
        }

        const userId = interaction.options.getString('user_id');
        const reason = interaction.options.getString('reason'); // Reason is now required

        try {
            await interaction.guild.members.unban(userId, { reason });
            await interaction.reply({ content: `User with ID ${userId} has been unbanned for the following reason: ${reason}` }); // Notification is visible to everyone
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: "Failed to unban the user. They might not be banned, or I might lack the permission to unban them.", ephemeral: true });
        }
    },
};
