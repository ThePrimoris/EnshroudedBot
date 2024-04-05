const { EmbedBuilder } = require('discord.js');
const { UserInfraction } = require('../../database'); // Adjust path as necessary

module.exports = {
    data: {
        name: 'infraction',
        description: 'Records an infraction for a user.',
        options: [
            {
                name: 'user',
                type: 'USER',
                description: 'The user to record the infraction for.',
                required: true,
            },
            {
                name: 'reason',
                type: 'STRING',
                description: 'The reason for the infraction.',
                required: true,
            },
        ],
    },
    async execute(interaction) {
        if (!interaction.member.permissions.has('MANAGE_ROLES')) {
            return interaction.reply({ content: "You don't have permission to use this command.", ephemeral: true });
        }

        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason');
        const issuerName = interaction.user.username; // Using username as an example

        try {
            await UserInfraction.create({
                userId: user.id,
                reason: reason,
                issuerName: issuerName,
            });

            await interaction.reply(`Infraction recorded for ${user.username} for reason: ${reason}`);
        } catch (error) {
            console.error('Failed to record infraction:', error);
            await interaction.reply({ content: 'Failed to record infraction. Please try again later.', ephemeral: true });
        }
    },
};
