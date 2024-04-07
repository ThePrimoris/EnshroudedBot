const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: {
        name: 'ban',
        description: 'Ban a user from the server.',
        options: [
            {
                name: 'user',
                type: 'USER',
                description: 'The user to be banned.',
                required: true,
            },
            {
                name: 'reason',
                type: 'STRING',
                description: 'The reason for the ban.',
                required: true,
            },
        ],
    },
    category: 'moderation',
    async execute(interaction) {
        // Check if the user has permissions to ban members
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return interaction.reply({ content: "You do not have permission to use this command.", ephemeral: true });
        }

        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason');

        try {
            // Ban the user
            await interaction.guild.members.ban(user.id, { reason });
            await interaction.reply({ content: `${user.username} has been banned for the following reason: ${reason}` });
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: "Failed to ban the user. They might have a higher role than me or I lack the permission to ban them.", ephemeral: true });
        }
    },
};
