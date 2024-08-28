const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('membercount')
        .setDescription('Displays the number of members in the server'),
    requiredPermissions: ['BanMembers'], // Custom property for your command handler
    category: 'moderation', // Custom property for your command handler
    async execute(interaction) {
        // Permission check (if necessary)
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }

        const guild = interaction.guild;
        const memberCount = guild.memberCount;

        await interaction.reply({ content: `This server has **${memberCount}** members!`, ephemeral: true });
    },
};
