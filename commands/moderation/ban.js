const { EmbedBuilder } = require('discord.js');

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
                required: true, // Updated to make reason required
            },
        ],
    },
    async execute(interaction) {
        // Check for BanMembers permission before proceeding with the /ban command
        if (!interaction.member.permissions.has('BAN_MEMBERS')) {
            return interaction.reply({ content: "You don't have permission to use this command." });
        }

        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason'); // No longer using a default reason

        try {
            await interaction.guild.members.ban(user.id, { reason });
            await interaction.reply({ content: `${user.username} has been banned for the following reason: ${reason}` }); // Removed ephemeral: true to make it visible to everyone
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: "Failed to ban the user. They might have a higher role than me or I lack the permission to ban them." });
        }
    },
};
