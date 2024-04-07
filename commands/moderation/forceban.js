const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('forceban')
        .setDescription('Ban a user not in the server by their ID.')
        .addStringOption(option => 
            option.setName('userid')
                .setDescription('The ID of the user to ban.')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('reason')
                .setDescription('The reason for the ban.')
                .setRequired(false)), // Making reason optional here
    category: 'moderation',
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return interaction.reply({ content: "You do not have permission to use this command.", ephemeral: true });
        }

        const userId = interaction.options.getString('userid');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        try {
            await interaction.guild.members.ban(userId, { reason });
            await interaction.reply({ content: `The user with ID ${userId} has been banned for the following reason: ${reason}.` });
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: "Failed to ban the user. Please make sure the ID is correct and I have the permission to ban them.", ephemeral: true });
        }
    },
};
