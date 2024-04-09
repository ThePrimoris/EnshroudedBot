const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a user from the server.')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user to be banned.')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('reason')
                .setDescription('The reason for the ban.')
                .setRequired(true)),
    requiredPermissions: ['BanMembers'],
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
